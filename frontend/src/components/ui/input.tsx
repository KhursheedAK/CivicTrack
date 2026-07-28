import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  function Input({ className, type, ...props }, ref) {
    return (
      <InputPrimitive
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
          // Dark mode: sunken-well affordance so the field reads as "typeable"
          // at rest, distinct from the surface it sits on and from plain text.
          "dark:h-auto dark:min-h-[42px] dark:px-[14px] dark:py-[10px] dark:cursor-text dark:bg-[var(--input-well)] dark:border-[var(--input-border)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] dark:transition-[border-color,box-shadow,background-color] dark:duration-150 dark:placeholder:text-[var(--input-placeholder)] dark:placeholder:not-italic",
          // Hover (enabled only) — subtle border strengthen, tells the user "this reacts"
          "dark:enabled:hover:border-[var(--input-border-hover)]",
          // Focus — unmistakable: solid accent border, field "wakes up" a shade lighter
          "dark:focus-visible:ring-0 dark:focus-visible:border-[var(--brand-accent)] dark:focus-visible:bg-[var(--input-well-focus)] dark:focus-visible:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35),0_0_0_3px_rgba(77,141,255,0.22)]",
          // Disabled / read-only — looks LOCKED (flush with the surface, dashed
          // border, muted text), not just a dimmed sunken well
          "dark:disabled:opacity-100 dark:disabled:cursor-not-allowed dark:disabled:bg-transparent dark:disabled:shadow-none dark:disabled:border-dashed dark:disabled:border-[var(--input-disabled-border)] dark:disabled:text-[var(--text-muted)]",
          "dark:read-only:cursor-not-allowed dark:read-only:bg-transparent dark:read-only:shadow-none dark:read-only:border-dashed dark:read-only:border-[var(--input-disabled-border)] dark:read-only:text-[var(--text-muted)] dark:read-only:hover:border-[var(--input-disabled-border)]",
          // Invalid state — reuses --destructive (already aliased to the danger token)
          "dark:aria-invalid:border-destructive dark:aria-invalid:ring-3 dark:aria-invalid:ring-destructive/20",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
