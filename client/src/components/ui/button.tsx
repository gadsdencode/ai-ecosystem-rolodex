import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // New Overture Systems variants
        brand: 
          "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-brand hover:shadow-brand-lg hover:scale-[1.02] active:scale-[0.98]",
        "brand-outline":
          "border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10 hover:border-primary-400 dark:text-primary-400 dark:border-primary-400",
        "brand-ghost":
          "text-primary-500 hover:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-400/10",
        gradient:
          "bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 text-white shadow-brand hover:shadow-brand-lg hover:brightness-110 active:brightness-95 bg-[length:200%_100%] hover:bg-right transition-all duration-300",
        glow:
          "bg-primary-500 text-white shadow-glow hover:shadow-glow-lg hover:bg-primary-400 dark:bg-primary-600 dark:hover:bg-primary-500",
        "glow-purple":
          "bg-secondary-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:bg-secondary-400",
        "glow-rose":
          "bg-accent-500 text-white shadow-glow-rose hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] hover:bg-accent-400",
        glass:
          "glass text-foreground hover:bg-white/80 dark:hover:bg-slate-900/80 border border-white/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-12 rounded-lg px-10 text-base font-semibold",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
