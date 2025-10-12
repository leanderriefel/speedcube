import { Loader2Icon } from "lucide-react"
import type { ComponentProps, JSX } from "react"

import { cn } from "~/lib"

const Spinner = ({
  className,
  ...props
}: ComponentProps<"svg">): JSX.Element => {
  return (
    // @ts-expect-error - Loader2Icon is a valid SVG element but TS is complaining
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
