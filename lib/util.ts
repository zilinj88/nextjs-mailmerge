export const atOrThrow = <T>(array: readonly T[], key: number): T => {
  const item = array.at(key)
  if (item === undefined) throw new Error(`Array ${array} does not contain an item at index ${key}`)
  return item
}
