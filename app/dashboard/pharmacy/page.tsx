"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { AlertBanner } from "@/components/ui/AlertBanner"
import { Search, QrCode, CheckCircle, Wallet } from "lucide-react"
import { connectWallet, signTx, WalletProvider, type WalletInfo } from "@/lib/cardano/walletAdapter"
import { submitTx } from "@/lib/cardano/builder"
import { addressToPubKeyHash } from "@/lib/cardano/utils"
import { getAllExplorerUrls } from "@/lib/cardano/explorer"
import { RedeemerAction } from "@/lib/cardano/types"

export default function PharmacyDashboard() {
    const [prescriptionId, setPrescriptionId] = React.useState("")
    const [verificationResult, setVerificationResult] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(false)
    const [wallet, setWallet] = React.useState<WalletInfo | null>(null)
    const [error, setError] = React.useState<string>("")
    const [status, setStatus] = React.useState<string>("")
    const [txHash, setTxHash] = React.useState<string>("")

    const handleConnectWallet = async () => {
        try {
            const availableWallets = [
                WalletProvider.NAMI,
                WalletProvider.ETERNL,
                WalletProvider.FLINT,
                WalletProvider.LACE,
                WalletProvider.GERO,
            ].filter((provider) => {
                if (typeof window === "undefined") return false
                switch (provider) {
                    case WalletProvider.NAMI:
                        return !!window.cardano?.nami
                    case WalletProvider.ETERNL:
                        return !!window.cardano?.eternl
                    case WalletProvider.FLINT:
                        return !!window.cardano?.flint
                    case WalletProvider.LACE:
                        return !!window.cardano?.lace
                    case WalletProvider.GERO:
                        return !!window.cardano?.gero
                    default:
                        return false
                }
            })

            if (availableWallets.length === 0) {
                throw new Error("No Cardano wallet found. Please install Nami, Eternl, Flint, Lace, or Gero.")
            }

            const connectedWallet = await connectWallet(availableWallets[0])
            setWallet(connectedWallet)
            setError("")
        } catch (err: any) {
            setError(err.message || "Failed to connect wallet")
        }
    }

    const handleVerify = async () => {
        if (!prescriptionId.trim()) {
            setError("Please enter a prescription ID")
            return
        }

        setLoading(true)
        setError("")
        setStatus("")

        try {
            const response = await fetch(`/api/prescription/${prescriptionId}`)
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to fetch prescription")
            }

            const { prescription } = await response.json()
            setVerificationResult({
                id: prescription.id,
                drug: prescription.drug_name,
                dosage: prescription.dosage,
                quantity: prescription.quantity,
                status: prescription.status,
                expiry: prescription.expiry,
                utxo_reference: prescription.utxo_reference,
                script_address: prescription.script_address,
            })
        } catch (err: any) {
            setError(err.message || "Failed to verify prescription")
            setVerificationResult(null)
        } finally {
            setLoading(false)
        }
    }

    const handleDispense = async () => {
        if (!wallet) {
            setError("Please connect your wallet first")
            return
        }

        if (!verificationResult) {
            setError("Please verify a prescription first")
            return
        }

        if (verificationResult.status !== "issued" && verificationResult.status !== "partially_redeemed") {
            setError("This prescription cannot be redeemed")
            return
        }

        setLoading(true)
        setError("")
        setStatus("Processing redemption...")

        try {
            const scriptAddressResponse = await fetch("/api/validator/address")
            if (!scriptAddressResponse.ok) {
                throw new Error("Failed to get validator script address")
            }
            const { address: scriptAddress } = await scriptAddressResponse.json()

            const validatorScriptResponse = await fetch("/api/validator/script")
            if (!validatorScriptResponse.ok) {
                throw new Error("Failed to get validator script")
            }
            const validatorScript = await validatorScriptResponse.json()

            const utxoRefParts = verificationResult.utxo_reference.split("#")
            if (utxoRefParts.length !== 2) {
                throw new Error("Invalid UTxO reference format")
            }

            const pharmacyPubKeyHash = await addressToPubKeyHash(wallet.address)

            const redeemResponse = await fetch("/api/prescription/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    input: {
                        utxo: {
                            txHash: utxoRefParts[0],
                            outputIndex: parseInt(utxoRefParts[1]),
                            utxoRef: verificationResult.utxo_reference,
                            scriptAddress: scriptAddress,
                            datum: {
                                prescriptionId: verificationResult.id,
                                patientHash: "",
                                drugId: verificationResult.drug,
                                dosage: verificationResult.dosage,
                                quantity: verificationResult.quantity,
                                doctorPubKeyHash: "",
                                issuedAt: 0,
                                expiryAt: Math.floor(new Date(verificationResult.expiry).getTime() / 1000),
                                refillsRemaining: 0,
                            },
                            lovelace: BigInt(2_000_000),
                        },
                        redeemer: {
                            action: RedeemerAction.REDEEM,
                            pharmacyPubKeyHash: pharmacyPubKeyHash,
                        },
                    },
                    pharmacyWalletAddress: wallet.address,
                    validatorScript: validatorScript,
                    scriptAddress: scriptAddress,
                    pharmacyId: wallet.address,
                    idempotencyKey: `${verificationResult.id}-${Date.now()}`,
                }),
            })

            if (!redeemResponse.ok) {
                const errorData = await redeemResponse.json()
                throw new Error(errorData.error || "Failed to create redemption transaction")
            }

            const { unsignedTx } = await redeemResponse.json()
            setStatus("Please sign the transaction in your wallet...")

            const signedTx = await signTx(unsignedTx, wallet)
            setStatus("Submitting transaction to blockchain...")

            const hash = await submitTx(signedTx)
            setTxHash(hash)
            setStatus("Transaction submitted successfully!")
            setVerificationResult((prev: any) => ({ ...prev, status: "redeemed" }))
        } catch (err: any) {
            setError(err.message || "Failed to redeem prescription")
            setStatus("")
        } finally {
            setLoading(false)
        }
    }

    if (txHash) {
        const network = "Preview"
        const explorerUrls = getAllExplorerUrls(txHash, network)
        
        return (
            <div className="space-y-6">
                <Card className="border-2 border-green-500">
                    <CardHeader>
                        <CardTitle className="text-green-600">Prescription Redeemed Successfully!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Transaction Hash:</p>
                            <code className="bg-muted px-2 py-1 rounded text-xs break-all block">{txHash}</code>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground">View on blockchain explorer:</p>
                            <div className="flex gap-2">
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
                        <Button onClick={() => {
                            setTxHash("")
                            setVerificationResult(null)
                            setPrescriptionId("")
                        }}>
                            Redeem Another Prescription
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pharmacy Verification</h1>
                <p className="text-muted-foreground">Verify and dispense prescriptions.</p>
            </div>

            {error && (
                <AlertBanner variant="destructive" title="Error">
                    {error}
                </AlertBanner>
            )}

            {status && (
                <AlertBanner variant="default" title="Status">
                    {status}
                </AlertBanner>
            )}

            {!wallet && (
                <Card>
                    <CardHeader>
                        <CardTitle>Connect Wallet</CardTitle>
                        <CardDescription>Connect your Cardano wallet to redeem prescriptions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleConnectWallet} className="w-full">
                            <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                        </Button>
                    </CardContent>
                </Card>
            )}

            {wallet && (
                <Card>
                    <CardHeader>
                        <CardTitle>Wallet Connected</CardTitle>
                        <CardDescription>
                            Address: <code className="text-xs">{wallet.address}</code>
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Verify Prescription</CardTitle>
                        <CardDescription>Enter the Prescription ID or scan the QR code.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Enter Prescription ID (e.g., RX-1001)"
                                value={prescriptionId}
                                onChange={(e) => setPrescriptionId(e.target.value)}
                            />
                            <Button onClick={handleVerify} disabled={loading}>
                                {loading ? "Verifying..." : <Search className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full">
                            <QrCode className="mr-2 h-4 w-4" /> Scan QR Code
                        </Button>
                    </CardContent>
                </Card>

                {verificationResult && (
                    <Card className="border-2 border-primary/10">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Verification Result</CardTitle>
                                <Badge
                                    variant={
                                        verificationResult.status === "valid" ? "success" :
                                            verificationResult.status === "used" ? "secondary" : "destructive"
                                    }
                                    className="text-sm px-3 py-1"
                                >
                                    {verificationResult.status.toUpperCase()}
                                </Badge>
                            </div>
                            <CardDescription>Prescription details from the blockchain.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-medium text-muted-foreground">Prescription ID</p>
                                    <p className="font-mono text-xs">{verificationResult.id}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Status</p>
                                    <p>{verificationResult.status}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Medication</p>
                                    <p className="font-semibold text-primary">{verificationResult.drug}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Dosage</p>
                                    <p>{verificationResult.dosage}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Quantity</p>
                                    <p>{verificationResult.quantity}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Expiry</p>
                                    <p>{new Date(verificationResult.expiry).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {verificationResult.status === "issued" && (
                                <AlertBanner variant="success" title="Valid Prescription">
                                    This prescription is authentic and has not been dispensed yet.
                                </AlertBanner>
                            )}
                            {verificationResult.status === "partially_redeemed" && (
                                <AlertBanner variant="default" title="Partially Redeemed">
                                    This prescription has been partially redeemed but has refills remaining.
                                </AlertBanner>
                            )}
                            {verificationResult.status === "redeemed" && (
                                <AlertBanner variant="warning" title="Already Dispensed">
                                    This prescription has already been fully redeemed.
                                </AlertBanner>
                            )}
                            {verificationResult.status === "expired" && (
                                <AlertBanner variant="destructive" title="Expired">
                                    This prescription has expired and cannot be redeemed.
                                </AlertBanner>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={handleDispense}
                                disabled={loading || (verificationResult.status !== "issued" && verificationResult.status !== "partially_redeemed") || !wallet}
                            >
                                {loading ? (
                                    "Processing..."
                                ) : verificationResult.status === "redeemed" ? (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Already Dispensed
                                    </>
                                ) : (
                                    "Redeem Prescription"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    )
}
