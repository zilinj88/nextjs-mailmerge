import { create } from 'zustand'

export interface UseGoogleServiceStore {
  gapInitialized: boolean
  gisInitialized: boolean
  tokenClient?: google.accounts.oauth2.TokenClient
  tokenResponse?: google.accounts.oauth2.TokenResponse
}

export const useGoogleService = create<UseGoogleServiceStore>(() => ({
  gapInitialized: false,
  gisInitialized: false,
  tokenClient: undefined,
  tokenResponse: undefined,
}))

export interface UserRow extends Record<string, string> {}
export interface UsersData {
  columns: string[]
  rows: UserRow[]
}

export interface UseAppDataStore {
  data?: UsersData
  selectedIndexes: number[]
  subjectTemplate: string
  mdTemplate: string
  setData: (data: UsersData | undefined) => void
  toggleSelected: (index: number) => void
  setAllSelected: (allSelected: boolean) => void
}

export const useAppDataStore = create<UseAppDataStore>((set, get) => ({
  data: undefined,
  selectedIndexes: [],
  subjectTemplate: '',
  mdTemplate: '',
  setData: (data) => {
    // clear selection
    set({ selectedIndexes: [], data })
  },
  toggleSelected: (index) => {
    const selectedIndexes = get().selectedIndexes
    const position = selectedIndexes.indexOf(index)
    if (position === -1) {
      set({ selectedIndexes: [...selectedIndexes, index] })
    } else {
      set({ selectedIndexes: selectedIndexes.toSpliced(position, 1) })
    }
  },
  setAllSelected: (allSelected) => {
    set({ selectedIndexes: allSelected ? get().data?.rows.map((_, index) => index) ?? [] : [] })
  },
}))
