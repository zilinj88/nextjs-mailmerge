export const atOrThrow = <T>(array: readonly T[], key: number): T => {
  const item = array.at(key)
  if (item === undefined) throw new Error(`Array ${array} does not contain an item at index ${key}`)
  return item
}

export const renderTemplate = (template: string, data: Record<string, string>): string =>
  Object.entries(data).reduce((current, [key, value]) => {
    return current.replaceAll(`{{${key}}}`, value)
  }, template)
