"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { AlertBanner } from "@/components/ui/AlertBanner"
import { Search, QrCode, CheckCircle } from "lucide-react"

export default function PharmacyDashboard() {
    const [prescriptionId, setPrescriptionId] = React.useState("")
    const [verificationResult, setVerificationResult] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(false)

    const handleVerify = () => {
        setLoading(true)
        // Simulate API call
        setTimeout(() => {
            setVerificationResult({
                id: prescriptionId || "RX-1001",
                prescriber: "Dr. John Doe",
                patient: "Alice Smith",
                drug: "Amoxicillin 500mg",
                status: "valid", // valid, used, expired
                date: "2023-10-25",
            })
            setLoading(false)
        }, 1000)
    }

    const handleDispense = () => {
        // Simulate dispense action
        setVerificationResult((prev: any) => ({ ...prev, status: "used" }))
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Pharmacy Verification</h1>
                <p className="text-muted-foreground">Verify and dispense prescriptions.</p>
            </div>

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
                                    <p className="font-medium text-muted-foreground">Prescriber</p>
                                    <p>{verificationResult.prescriber}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Date Issued</p>
                                    <p>{verificationResult.date}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Patient</p>
                                    <p>{verificationResult.patient}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Medication</p>
                                    <p className="font-semibold text-primary">{verificationResult.drug}</p>
                                </div>
                            </div>

                            {verificationResult.status === "valid" && (
                                <AlertBanner variant="success" title="Valid Prescription">
                                    This prescription is authentic and has not been dispensed yet.
                                </AlertBanner>
                            )}
                            {verificationResult.status === "used" && (
                                <AlertBanner variant="warning" title="Already Dispensed">
                                    This prescription has already been marked as dispensed.
                                </AlertBanner>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={handleDispense}
                                disabled={verificationResult.status !== "valid"}
                            >
                                {verificationResult.status === "used" ? (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" /> Dispensed
                                    </>
                                ) : (
                                    "Mark as Dispensed"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    )
}
