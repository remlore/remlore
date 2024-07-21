const MAX_LV = 22

export function level(): number[]
export function level(i?: number): number
export function level(i?: number) {
  const batch = [0]

  for (let i = 1; i <= MAX_LV; i++) {
    const tmp = Math.floor(i * (Math.sqrt(10 * (batch[i - 1] + MAX_LV)) + MAX_LV))
    batch[i] = tmp - (tmp % 10)
  }

  if (typeof i === 'number') return batch[i]

  return batch
}
