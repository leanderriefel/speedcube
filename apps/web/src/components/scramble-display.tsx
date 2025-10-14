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
    className="absolute top-4 mx-auto cursor-pointer px-4 text-center font-mono text-base sm:top-10 sm:px-10 sm:text-3xl"
    onClick={onClick}
  >
    {scramble.isPending
      ? "Generating scramble..."
      : scramble.isError
        ? "Error generating scramble"
        : scramble.data?.toString()}
  </p>
)
