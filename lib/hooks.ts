import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useStore } from '~/lib/util'

interface GoogleServiceToken extends google.accounts.oauth2.TokenResponse {
  expiresAt: number
}

export interface UseGoogleServiceStore {
  gapiInitialized: boolean
  gisInitialized: boolean
  token?: GoogleServiceToken
  email?: string
}

export const useGoogleService = create<UseGoogleServiceStore>(() => ({
  gapiInitialized: false,
  gisInitialized: false,
  token: undefined,
  email: undefined,
}))

export interface UserRow extends Record<string, string> {
  email: string
}

export interface UsersData {
  columns: string[]
  rows: UserRow[]
}

export interface UseAppDataStore {
  data?: UsersData
  selectedIndexes: number[]
  selectedIndex: number | undefined
  setData: (data: UsersData | undefined) => void
}

export const useAppDataStore = create<UseAppDataStore>((set) => ({
  data: undefined,
  selectedIndexes: [],
  selectedIndex: undefined,
  setData: (data) => {
    // clear selection
    set({ selectedIndexes: [], data, selectedIndex: undefined })
  },
}))

export interface UseTemplateStore {
  subjectTemplate: string
  mdTemplate: string
  // Hack: To check if this store is loaded from local storage
  isLoaded: boolean
}
export const useTemplateStore = create<UseTemplateStore>()(
  persist(
    () => ({
      subjectTemplate: '',
      mdTemplate: '',
      isLoaded: true as boolean,
    }),
    {
      name: 'app-data-template-storage',
    }
  )
)

export const useTemplateStoreSafe = <T>(selector: (state: UseTemplateStore) => T): T | undefined =>
  useStore(useTemplateStore, selector)
