'use client'

import Script from 'next/script'
import { useGoogleService } from '~/lib/hooks'
import { zenv } from '~/lib/zenv'

const gapiLoaded = () => {
  if (useGoogleService.getState().gapInited) {
    return
  }
  gapi.load('client', async () => {
    await gapi.client.init({
      apiKey: zenv.NEXT_PUBLIC_API_KEY,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
    })
    useGoogleService.setState({ gapInited: true })
  })
}

const gisLoaded = () => {
  if (useGoogleService.getState().gisInited) {
    return
  }
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: zenv.NEXT_PUBLIC_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/gmail.send',
    callback: (tokenResponse) => {
      useGoogleService.setState({ tokenResponse })
    },
  })
  useGoogleService.setState({ gisInited: true, tokenClient })
}

export const GoogleApi: React.FC = () => {
  return (
    <>
      <Script src='https://apis.google.com/js/api.js' onLoad={gapiLoaded} />
      <Script src='https://accounts.google.com/gsi/client' onLoad={gisLoaded} />
    </>
  )
}
