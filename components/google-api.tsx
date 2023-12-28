'use client'

import Script from 'next/script'
import { useGoogleService } from '~/lib/hooks'
import { zenv } from '~/lib/zenv'

const gapiLoaded = () => {
  if (useGoogleService.getState().gapiInitialized) {
    return
  }
  gapi.load('client', async () => {
    await gapi.client.init({
      apiKey: zenv.NEXT_PUBLIC_API_KEY,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
    })
    useGoogleService.setState({ gapiInitialized: true })
  })
}

const gisLoaded = () => {
  if (useGoogleService.getState().gisInitialized) {
    return
  }
  useGoogleService.setState({ gisInitialized: true })
}

export const GoogleApi: React.FC = () => {
  return (
    <>
      <Script src='https://apis.google.com/js/api.js' onLoad={gapiLoaded} />
      <Script src='https://accounts.google.com/gsi/client' onLoad={gisLoaded} />
    </>
  )
}
