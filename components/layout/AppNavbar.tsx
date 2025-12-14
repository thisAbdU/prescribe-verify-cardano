import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ShieldCheck } from "lucide-react"

export function AppNavbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block">
                            PrescribeVerify
                        </span>
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <nav className="flex items-center space-x-2">
                        {/* Placeholder for role-based nav items or user menu */}
                        <Button variant="ghost" size="sm">
                            Sign In
                        </Button>
                    </nav>
                </div>
            </div>
        </header>
    )
}
