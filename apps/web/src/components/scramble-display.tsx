import type { useScramble } from "~/lib/scramble"

type ScrambleResult = ReturnType<typeof useScramble>

type ScrambleDisplayProps = {
  scramble: ScrambleResult
  onClick: () => void
}

export const ScrambleDisplay = ({
  scramble,
  onClick,
}: ScrambleDisplayProps) => (
  <p
    className="text-base sm:text-3xl font-mono absolute top-4 mx-auto px-4 sm:top-10 sm:px-10 text-center cursor-pointer"
    onClick={onClick}
  >
    {scramble.isPending
      ? "Generating scramble..."
      : scramble.isError
      ? "Error generating scramble"
      : scramble.data?.toString()}
  </p>
)
