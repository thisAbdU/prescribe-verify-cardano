"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Stepper } from "@/components/ui/Stepper"
import { AlertBanner } from "@/components/ui/AlertBanner"
import { ArrowLeft, ArrowRight, Check, Wallet } from "lucide-react"
import { connectWallet, signTx, WalletProvider, type WalletInfo } from "@/lib/cardano/walletAdapter"
import { submitTx } from "@/lib/cardano/builder"
import { addressToPubKeyHash, hashPatientId, getScriptAddressFromValidator } from "@/lib/cardano/utils"
import { getAllExplorerUrls } from "@/lib/cardano/explorer"
import type { PrescriptionDatum } from "@/lib/cardano/types"

const steps = [
    { label: "Patient Info" },
    { label: "Medication" },
    { label: "Instructions" },
    { label: "Review & Sign" },
]

const formSchema = z.object({
    patientName: z.string().min(2, "Name is required"),
    patientId: z.string().min(2, "ID is required"),
    medicationName: z.string().min(2, "Medication name is required"),
    dosage: z.string().min(1, "Dosage is required"),
    quantity: z.string().min(1, "Quantity is required"),
    instructions: z.string().min(5, "Instructions are required"),
    expiryDate: z.string().min(1, "Expiry date is required"),
})

export default function CreatePrescriptionPage() {
    const [currentStep, setCurrentStep] = React.useState(0)
    const [txHash, setTxHash] = React.useState<string | null>(null)
    const [wallet, setWallet] = React.useState<WalletInfo | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [status, setStatus] = React.useState<string>("")

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            patientName: "",
            patientId: "",
            medicationName: "",
            dosage: "",
            quantity: "",
            instructions: "",
            expiryDate: "",
        },
    })

    const connectWalletHandler = async () => {
        try {
            setError(null)
            setStatus("Connecting wallet...")
            const walletInfo = await connectWallet(WalletProvider.NAMI)
            setWallet(walletInfo)
            setStatus("Wallet connected")
        } catch (err: any) {
            setError(err.message || "Failed to connect wallet")
            setStatus("")
        }
    }

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!wallet) {
            setError("Please connect your wallet first")
            return
        }

        setLoading(true)
        setError(null)
        setStatus("Preparing prescription...")

        try {
            const scriptAddress = await getScriptAddressFromValidator()
            setStatus("Building prescription datum...")

            const patientSalt = process.env.NEXT_PUBLIC_PATIENT_ID_SALT || "default-salt-change-in-production"
            const patientHash = await hashPatientId(data.patientId, patientSalt)
            const doctorPubKeyHash = await addressToPubKeyHash(wallet.address)
            const prescriptionId = window.crypto.randomUUID()
            const issuedAt = Math.floor(Date.now() / 1000)
            const expiryAt = Math.floor(new Date(data.expiryDate).getTime() / 1000)

            const quantityNum = parseInt(data.quantity) || 0
            if (isNaN(quantityNum) || quantityNum <= 0) {
                throw new Error("Invalid quantity")
            }

            const datum: PrescriptionDatum = {
                prescriptionId,
                patientHash,
                drugId: data.medicationName,
                dosage: data.dosage,
                quantity: quantityNum,
                doctorPubKeyHash,
                issuedAt,
                expiryAt,
                refillsRemaining: 0,
            }

            setStatus("Creating transaction...")
            const response = await fetch("/api/prescription/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    datum,
                    scriptAddress,
                    walletAddress: wallet.address,
                    doctorId: "doctor-1",
                    idempotencyKey: prescriptionId,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to create prescription transaction")
            }

            const { unsignedTx } = await response.json()
            setStatus("Please sign the transaction in your wallet...")

            const signedTx = await signTx(unsignedTx, wallet)
            setStatus("Submitting transaction to blockchain...")

            const hash = await submitTx(signedTx)
            setTxHash(hash)
            setStatus("Transaction submitted successfully!")
        } catch (err: any) {
            setError(err.message || "Failed to create prescription")
            setStatus("")
        } finally {
            setLoading(false)
        }
    }

    const nextStep = async () => {
        const fields = [
            ["patientName", "patientId"],
            ["medicationName", "dosage", "quantity"],
            ["instructions", "expiryDate"],
            [],
        ]

        const currentFields = fields[currentStep] as any
        const isValid = await form.trigger(currentFields)

        if (isValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
        }
    }

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0))
    }

    if (txHash) {
        const network = "Preview"
        const explorerUrls = getAllExplorerUrls(txHash, network)
        
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                        <CardTitle>Prescription Created!</CardTitle>
                        <CardDescription>The prescription has been successfully signed and recorded on the blockchain.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-md bg-muted p-4 text-xs font-mono break-all">
                            {txHash}
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground">View on blockchain explorer:</p>
                            <div className="flex gap-2 justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(explorerUrls.cardanoscan, "_blank")}
                                >
                                    Cardanoscan
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(explorerUrls.blockfrost, "_blank")}
                                >
                                    Blockfrost
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button onClick={() => window.location.href = '/dashboard/doctor'}>
                            Return to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create New Prescription</h1>
                <p className="text-muted-foreground">Fill in the details below to issue a new prescription.</p>
            </div>

            <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

            <Card>
                <CardHeader>
                    <CardTitle>{steps[currentStep].label}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        {currentStep === 0 && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Patient Name</label>
                                    <Input {...form.register("patientName")} placeholder="John Doe" />
                                    {form.formState.errors.patientName && (
                                        <p className="text-sm text-destructive">{form.formState.errors.patientName.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Patient ID / Email</label>
                                    <Input {...form.register("patientId")} placeholder="ID-12345 or email@example.com" />
                                    {form.formState.errors.patientId && (
                                        <p className="text-sm text-destructive">{form.formState.errors.patientId.message}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {currentStep === 1 && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Medication Name</label>
                                    <Input {...form.register("medicationName")} placeholder="e.g. Amoxicillin" />
                                    {form.formState.errors.medicationName && (
                                        <p className="text-sm text-destructive">{form.formState.errors.medicationName.message}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Dosage</label>
                                        <Input {...form.register("dosage")} placeholder="500mg" />
                                        {form.formState.errors.dosage && (
                                            <p className="text-sm text-destructive">{form.formState.errors.dosage.message}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Quantity</label>
                                        <Input {...form.register("quantity")} placeholder="30 capsules" />
                                        {form.formState.errors.quantity && (
                                            <p className="text-sm text-destructive">{form.formState.errors.quantity.message}</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {currentStep === 2 && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Instructions</label>
                                    <Textarea {...form.register("instructions")} placeholder="Take one capsule three times a day..." />
                                    {form.formState.errors.instructions && (
                                        <p className="text-sm text-destructive">{form.formState.errors.instructions.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Expiry Date</label>
                                    <Input type="date" {...form.register("expiryDate")} />
                                    {form.formState.errors.expiryDate && (
                                        <p className="text-sm text-destructive">{form.formState.errors.expiryDate.message}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <AlertBanner variant="default" title="Review Details">
                                    Please review the prescription details before signing. This action cannot be undone.
                                </AlertBanner>
                                
                                {!wallet && (
                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                        <p className="text-sm text-yellow-800 mb-2">Connect your wallet to continue</p>
                                        <Button onClick={connectWalletHandler} variant="outline" size="sm">
                                            <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                                        </Button>
                                    </div>
                                )}

                                {wallet && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                        <p className="text-sm text-green-800">
                                            Wallet connected: {wallet.address.slice(0, 20)}...
                                        </p>
                                    </div>
                                )}

                                {error && (
                                    <AlertBanner variant="destructive" title="Error">
                                        {error}
                                    </AlertBanner>
                                )}

                                {status && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <p className="text-sm text-blue-800">{status}</p>
                                    </div>
                                )}

                                <div className="rounded-lg border p-4 text-sm">
                                    <div className="grid grid-cols-2 gap-y-2">
                                        <span className="font-medium text-muted-foreground">Patient:</span>
                                        <span>{form.getValues("patientName")}</span>

                                        <span className="font-medium text-muted-foreground">Medication:</span>
                                        <span>{form.getValues("medicationName")}</span>

                                        <span className="font-medium text-muted-foreground">Dosage:</span>
                                        <span>{form.getValues("dosage")}</span>

                                        <span className="font-medium text-muted-foreground">Quantity:</span>
                                        <span>{form.getValues("quantity")}</span>

                                        <span className="font-medium text-muted-foreground">Expiry:</span>
                                        <span>{form.getValues("expiryDate")}</span>
                                    </div>
                                    <div className="mt-4 border-t pt-2">
                                        <span className="font-medium text-muted-foreground">Instructions:</span>
                                        <p className="mt-1">{form.getValues("instructions")}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>

                    {currentStep < steps.length - 1 ? (
                        <Button onClick={nextStep}>
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={form.handleSubmit(onSubmit)} 
                            className="bg-primary hover:bg-primary/90"
                            disabled={loading || !wallet}
                        >
                            {loading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Wallet className="mr-2 h-4 w-4" /> Sign with Wallet
                                </>
                            )}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
