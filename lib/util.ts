import { round } from 'lodash'
import { useEffect, useState } from 'react'

export const atOrThrow = <T>(array: readonly T[], key: number): T => {
  const item = array.at(key)
  if (item === undefined) throw new Error(`Array ${array} does not contain an item at index ${key}`)
  return item
}

export const renderTemplate = (template: string, data: Record<string, string>): string =>
  Object.entries(data).reduce((current, [key, value]) => {
    return current.replaceAll(`{{${key}}}`, value)
  }, template)

// We use this to prevent hydration error with zustand using local storage persist
// https://dev.to/abdulsamad/how-to-use-zustands-persist-middleware-in-nextjs-4lb5
export const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
): F | undefined => {
  const result = store(callback) as F
  const [data, setData] = useState<F>()

  useEffect(() => {
    setData(result)
  }, [result])

  return data
}

export const readableFileSize = (fileSize: number): string => {
  const DEFAULT_SIZE = 0
  if (!fileSize) {
    return `${DEFAULT_SIZE} KB`
  }
  const format = (number: number) => {
    return round(number, 2)
  }

  const sizeInKb = fileSize / 1024

  if (sizeInKb > 1024) {
    return `${format(sizeInKb / 1024)} MB`
  } else if (sizeInKb > 10) {
    return `${format(sizeInKb)} KB`
  } else {
    return `${format(fileSize)} Bytes`
  }
}
