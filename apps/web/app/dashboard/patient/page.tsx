import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Download, QrCode } from "lucide-react"

export default function PatientView() {
    // Simulated data
    const prescription = {
        id: "RX-1001",
        prescriber: "Dr. John Doe",
        patient: "Alice Smith",
        drug: "Amoxicillin 500mg",
        instructions: "Take one capsule three times a day for 7 days.",
        status: "Valid",
        date: "2023-10-25",
        expiry: "2023-11-25",
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <QrCode className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">Prescription Details</CardTitle>
                    <CardDescription>Scan this code at a verified pharmacy.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center">
                        {/* Placeholder for actual QR Code */}
                        <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed bg-muted">
                            <span className="text-muted-foreground">QR Code</span>
                        </div>
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge variant="success" className="px-3 py-1 text-sm">
                                {prescription.status}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Medication</p>
                                <p className="font-semibold">{prescription.drug}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Prescriber</p>
                                <p className="font-medium">{prescription.prescriber}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Patient</p>
                                <p className="font-medium">{prescription.patient}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">{prescription.date}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Instructions</p>
                            <p className="text-sm font-medium">{prescription.instructions}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </CardFooter>
            </Card>
            <p className="mt-8 text-center text-xs text-muted-foreground">
                Powered by PrescribeVerify on Cardano
            </p>
        </div>
    )
}
