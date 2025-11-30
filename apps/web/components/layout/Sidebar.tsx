import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { LayoutDashboard, FileText, History, Settings } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    role: "doctor" | "pharmacy"
}

export function Sidebar({ className, role }: SidebarProps) {
    // In a real app, usePathname would be used to highlight active link
    // const pathname = usePathname() 

    const doctorItems = [
        { name: "Dashboard", href: "/dashboard/doctor", icon: LayoutDashboard },
        { name: "Create Prescription", href: "/dashboard/doctor/create", icon: FileText },
        { name: "History", href: "/dashboard/doctor/history", icon: History },
        { name: "Settings", href: "/dashboard/doctor/settings", icon: Settings },
    ]

    const pharmacyItems = [
        { name: "Dashboard", href: "/dashboard/pharmacy", icon: LayoutDashboard },
        { name: "Verify", href: "/dashboard/pharmacy/verify", icon: FileText },
        { name: "History", href: "/dashboard/pharmacy/history", icon: History },
        { name: "Settings", href: "/dashboard/pharmacy/settings", icon: Settings },
    ]

    const items = role === "doctor" ? doctorItems : pharmacyItems

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        {role === "doctor" ? "Doctor Portal" : "Pharmacy Portal"}
                    </h2>
                    <div className="space-y-1">
                        {items.map((item) => (
                            <Button
                                key={item.href}
                                variant="ghost" // Should be "secondary" if active
                                className="w-full justify-start"
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.name}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
