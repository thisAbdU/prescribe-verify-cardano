import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"
import { Plus } from "lucide-react"

export default function DoctorDashboard() {
    const recentPrescriptions = [
        { id: "RX-1001", patient: "Alice Smith", drug: "Amoxicillin 500mg", date: "2023-10-25", status: "Pending" },
        { id: "RX-1002", patient: "Bob Jones", drug: "Lisinopril 10mg", date: "2023-10-24", status: "Filled" },
        { id: "RX-1003", patient: "Charlie Brown", drug: "Metformin 500mg", date: "2023-10-20", status: "Expired" },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
                    <p className="text-muted-foreground">Manage your prescriptions and patient records.</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/doctor/create">
                        <Plus className="mr-2 h-4 w-4" /> Create Prescription
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Requires attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">573</div>
                        <p className="text-xs text-muted-foreground">+201 since last year</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Prescriptions</CardTitle>
                    <CardDescription>A list of recent prescriptions issued by you.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Drug</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentPrescriptions.map((rx) => (
                                <TableRow key={rx.id}>
                                    <TableCell className="font-medium">{rx.id}</TableCell>
                                    <TableCell>{rx.patient}</TableCell>
                                    <TableCell>{rx.drug}</TableCell>
                                    <TableCell>{rx.date}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                rx.status === "Pending" ? "warning" :
                                                    rx.status === "Filled" ? "success" : "destructive"
                                            }
                                        >
                                            {rx.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
