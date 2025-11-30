import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperProps {
    steps: {
        label: string
        description?: string
    }[]
    currentStep: number
    className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
    return (
        <div className={cn("w-full", className)}>
            <div className="relative flex items-center justify-between">
                {/* Progress Bar Background */}
                <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 bg-muted" />

                {/* Active Progress Bar */}
                <div
                    className="absolute left-0 top-1/2 -z-10 h-1 -translate-y-1/2 bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStep
                    const isCurrent = index === currentStep

                    return (
                        <div key={index} className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background transition-colors duration-300",
                                    isCompleted
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : isCurrent
                                            ? "border-primary text-primary"
                                            : "border-muted text-muted-foreground"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <span className="text-xs font-semibold">{index + 1}</span>
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <div
                                    className={cn(
                                        "text-xs font-medium",
                                        isCurrent ? "text-foreground" : "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
