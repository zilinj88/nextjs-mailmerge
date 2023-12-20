import { create } from 'zustand'

interface UseGoogleServiceStore {
  gapInited: boolean
  gisInited: boolean
  tokenClient?: google.accounts.oauth2.TokenClient
  tokenResponse?: google.accounts.oauth2.TokenResponse
}

export const useGoogleService = create<UseGoogleServiceStore>(() => ({
  gapInited: false,
  gisInited: false,
  tokenClient: undefined,
  tokenResponse: undefined,
}))
