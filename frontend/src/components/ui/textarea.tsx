import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
          // Dark mode: same sunken-well recipe as Input, min-height 96px, vertical resize only
          "dark:min-h-[96px] dark:resize-y dark:cursor-text dark:bg-[var(--input-well)] dark:border-[var(--input-border)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35)] dark:transition-[border-color,box-shadow,background-color] dark:duration-150 dark:placeholder:text-[var(--input-placeholder)] dark:placeholder:not-italic",
          "dark:enabled:hover:border-[var(--input-border-hover)]",
          "dark:focus-visible:ring-0 dark:focus-visible:border-[var(--brand-accent)] dark:focus-visible:bg-[var(--input-well-focus)] dark:focus-visible:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35),0_0_0_3px_rgba(77,141,255,0.22)]",
          "dark:disabled:opacity-100 dark:disabled:cursor-not-allowed dark:disabled:bg-transparent dark:disabled:shadow-none dark:disabled:border-dashed dark:disabled:border-[var(--input-disabled-border)] dark:disabled:text-[var(--text-muted)]",
          "dark:read-only:cursor-not-allowed dark:read-only:bg-transparent dark:read-only:shadow-none dark:read-only:border-dashed dark:read-only:border-[var(--input-disabled-border)] dark:read-only:text-[var(--text-muted)]",
          "dark:aria-invalid:border-destructive dark:aria-invalid:ring-3 dark:aria-invalid:ring-destructive/20",
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
