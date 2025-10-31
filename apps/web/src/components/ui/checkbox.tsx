"use client"

import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "~/lib"

type CheckboxVariant = "default" | "indeterminate"

function Checkbox({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  variant?: CheckboxVariant
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-4 shrink-0 cursor-pointer rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        {
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:data-[state=checked]:bg-primary":
            variant === "default",
          "data-[state=checked]:border-muted-foreground/60 data-[state=checked]:bg-transparent data-[state=checked]:text-muted-foreground":
            variant === "indeterminate",
        },
        className,
      )}
      checked={variant === "indeterminate" ? true : props.checked}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5 translate-y-[0.5px]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
