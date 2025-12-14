import { Sidebar } from "@/components/layout/Sidebar"
import { AppNavbar } from "@/components/layout/AppNavbar"

export default function DoctorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <AppNavbar />
            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
                <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
                    <Sidebar role="doctor" className="py-6" />
                </aside>
                <main className="flex w-full flex-col overflow-hidden py-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
