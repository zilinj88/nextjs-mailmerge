import { useGoogleService } from '~/lib/hooks'
import { zenv } from '~/lib/zenv'

export const requestGoogleAccessToken = (): Promise<google.accounts.oauth2.TokenResponse> => {
  const token = useGoogleService.getState().token
  if (token && token.expiresAt > Date.now()) {
    return Promise.resolve(token)
  }
  return new Promise((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: zenv.NEXT_PUBLIC_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/gmail.compose',
      callback: (response) => {
        // When valid access token is returned
        if (response.access_token) {
          useGoogleService.setState({
            token: {
              ...response,
              // Give 5 seconds interval before expiration
              expiresAt: new Date().getTime() + Number(response.expires_in) * 1000 - 5000,
            },
          })
          resolve(response)
          return
        }
        // Reject with error
        reject(new Error(response.error, { cause: response }))
      },
      error_callback: (error) => {
        reject(error)
      },
    })
    // Skip account selection when token is already set for gapi.client
    // Can be reset by sign out button
    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' })
    } else {
      tokenClient.requestAccessToken({ prompt: '' })
    }
  })
}

export const signOut = (): void => {
  useGoogleService.setState({ token: undefined })
  const accessToken = gapi.client.getToken()
  // No timing attack issues because this is not a secret (exposed to client)
  if (accessToken !== null) {
    google.accounts.oauth2.revoke(accessToken.access_token, () => {})
    gapi.client.setToken(null)
  }
}
