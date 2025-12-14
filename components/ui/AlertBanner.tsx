import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const alertVariants = cva(
    "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
    {
        variants: {
            variant: {
                default: "bg-background text-foreground",
                destructive:
                    "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
                success:
                    "border-green-500/50 text-green-600 dark:border-green-500 [&>svg]:text-green-600",
                warning:
                    "border-yellow-500/50 text-yellow-600 dark:border-yellow-500 [&>svg]:text-yellow-600",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const icons = {
    default: Info,
    destructive: XCircle,
    success: CheckCircle,
    warning: AlertCircle,
}

interface AlertProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
    title?: string
}

const AlertBanner = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = "default", title, children, ...props }, ref) => {
        const Icon = icons[variant || "default"]

        return (
            <div
                ref={ref}
                role="alert"
                className={cn(alertVariants({ variant }), className)}
                {...props}
            >
                <Icon className="h-4 w-4" />
                {title && <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>}
                <div className="text-sm [&_p]:leading-relaxed">{children}</div>
            </div>
        )
    }
)
AlertBanner.displayName = "AlertBanner"

export { AlertBanner }
