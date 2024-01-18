import type { Subscription } from 'rxjs'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SendBatchProgress } from '~/lib/send-batch'
import { useStore } from '~/lib/util'

interface GoogleServiceToken extends google.accounts.oauth2.TokenResponse {
  expiresAt: number
}

export interface UseGoogleServiceStore {
  gapiInitialized: boolean
  gisInitialized: boolean
  token?: GoogleServiceToken
}

export const useGoogleService = create<UseGoogleServiceStore>(() => ({
  gapiInitialized: false,
  gisInitialized: false,
  token: undefined,
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
  selectedIndex: number | undefined
  setData: (data: UsersData | undefined) => void
}

export const useAppDataStore = create<UseAppDataStore>((set) => ({
  data: undefined,
  selectedIndex: undefined,
  setData: (data) => {
    // clear selection
    set({ data, selectedIndex: data && data.rows.length > 0 ? 0 : undefined })
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

type SendBatchStatus = 'idle' | 'sending' | 'finished' | 'cancelled'
export interface UseSendBatchStateStore extends SendBatchProgress {
  total: number
  status: SendBatchStatus
  subscription: Subscription | undefined
  start: (total: number, subscription: Subscription) => void
  update: (progress: SendBatchProgress) => void
  finish: () => void
  clear: () => void
  cancel: () => void
}

const initState = {
  total: 0,
  succeed: 0,
  failed: 0,
  status: 'idle',
  subscription: undefined,
} as const

export const useSendBatchState = create<UseSendBatchStateStore>((set, get) => ({
  ...initState,
  start: (total, subscription) => set({ ...initState, status: 'sending', total, subscription }),
  update: (progress) => set({ ...progress }),
  finish: () => set({ status: 'finished' }),
  clear: () => {
    const subscription = get().subscription
    if (subscription && !subscription.closed) {
      throw new Error('Send batch work in progress')
    }
    set({ ...initState })
  },
  cancel: () => {
    const subscription = get().subscription
    if (subscription && !subscription.closed) {
      subscription.unsubscribe()
    }
    set({ status: 'cancelled', subscription: undefined })
  },
}))
