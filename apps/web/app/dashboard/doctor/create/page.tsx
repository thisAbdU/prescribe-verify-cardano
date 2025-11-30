"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Stepper } from "@/components/ui/Stepper"
import { AlertBanner } from "@/components/ui/AlertBanner"
import { ArrowLeft, ArrowRight, Check, Wallet } from "lucide-react"

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

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        // Simulate signing and submission
        console.log(data)
        setTimeout(() => {
            setTxHash("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef")
        }, 1500)
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
                    <CardContent>
                        <div className="rounded-md bg-muted p-4 text-xs font-mono break-all">
                            {txHash}
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
                        <Button onClick={form.handleSubmit(onSubmit)} className="bg-primary hover:bg-primary/90">
                            <Wallet className="mr-2 h-4 w-4" /> Sign with Wallet
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
