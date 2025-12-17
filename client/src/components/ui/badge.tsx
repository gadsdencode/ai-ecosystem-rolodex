import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: 
          "text-foreground border-border",
        // New Overture Systems variants
        brand:
          "border-transparent bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-sm",
        "brand-outline":
          "border-primary-500 text-primary-500 dark:text-primary-400 dark:border-primary-400 bg-primary-500/5",
        success:
          "border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm",
        warning:
          "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm",
        info:
          "border-transparent bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm",
        glow:
          "border-transparent bg-primary-500 text-white shadow-glow hover:shadow-glow-md",
        "glow-purple":
          "border-transparent bg-secondary-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)] hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]",
        "glow-rose":
          "border-transparent bg-accent-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)] hover:shadow-[0_0_15px_rgba(244,63,94,0.5)]",
        glass:
          "border-white/20 bg-white/20 dark:bg-white/10 text-foreground backdrop-blur-sm",
        // Status badges
        production:
          "border-transparent bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white font-mono text-[10px] tracking-wider",
        development:
          "border-transparent bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white font-mono text-[10px] tracking-wider",
        // Provider badges
        overture:
          "border-transparent bg-gradient-to-r from-primary-500/90 to-secondary-500/90 text-white font-mono text-[10px] tracking-wider",
        "third-party":
          "border-border bg-muted/50 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
