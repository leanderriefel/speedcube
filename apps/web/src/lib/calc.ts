type SolveResult =
  | {
      time: number
      dnf: false
    }
  | {
      time: undefined
      dnf: true
    }

export const mean = (values: SolveResult[]): SolveResult => {
  if (values.some((v) => v.dnf)) {
    return {
      time: undefined,
      dnf: true,
    }
  }

  const sum = values
    .filter((v) => !v.dnf)
    .reduce((acc, value) => acc + value.time, 0)
  const average = sum / values.length || 0

  return {
    time: average,
    dnf: false,
  }
}

export const average = (values: SolveResult[]): SolveResult => {
  values.sort((a, b) => {
    if (a.dnf) return 1
    if (b.dnf) return -1
    return a.time - b.time
  })

  const removeCount = Math.max(1, Math.floor(values.length * 0.05))
  const trimmed = values.slice(removeCount, values.length - removeCount)
  return mean(trimmed)
}
