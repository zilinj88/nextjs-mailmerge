import { pick } from 'lodash'
import { useMemo } from 'react'
import type { Subscription } from 'rxjs'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SendBatchProgress } from '~/lib/send-batch'
import type { PreviewWarning } from '~/lib/use-update-preview-warnings'
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
  error?: unknown
  selectedUser?: UserRow
  attachments: File[]
  warnings: PreviewWarning[]
  setData: (data: UsersData | undefined) => void
  addAttachments: (files: File[]) => void
  removeAttachment: (file: File) => void
}

export const useAppDataStore = create<UseAppDataStore>((set, get) => ({
  data: undefined,
  error: undefined,
  selectedUser: undefined,
  attachments: [],
  warnings: [],
  setData: (data) => {
    // clear selection
    set({
      data,
      selectedUser: data?.rows.at(0),
      error: undefined,
    })
  },
  addAttachments: (files: File[]) => {
    set({ attachments: [...get().attachments, ...files] })
  },
  removeAttachment: (file: File) => {
    set({ attachments: get().attachments.filter((f) => f !== file) })
  },
}))

export interface UseTemplateStore {
  subjectTemplate: string
  bodyTemplate: string
  // Hack: To check if this store is loaded from local storage
  isLoaded: boolean
}
export const useTemplateStore = create<UseTemplateStore>()(
  persist(
    () => ({
      subjectTemplate: '',
      bodyTemplate: '',
      isLoaded: true as boolean,
    }),
    {
      name: 'app-data-template-storage',
      partialize: (state) => pick(state, ['subjectTemplate', 'bodyTemplate']),
    }
  )
)

export const useTemplateStoreSafe = <T>(selector: (state: UseTemplateStore) => T): T | undefined =>
  useStore(useTemplateStore, selector)

export const useAttachmentsSize = (): number => {
  const attachments = useAppDataStore((state) => state.attachments)
  return useMemo(
    () => attachments.reduce((totalSize, file) => totalSize + file.size, 0),
    [attachments]
  )
}

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
