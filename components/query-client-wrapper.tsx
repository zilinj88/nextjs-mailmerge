'use client'

import { Text } from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import type { PropsWithChildren } from 'react'
import { MutationCache, QueryClient, QueryClientProvider } from 'react-query'

const handleError = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error'
  showNotification({
    title: 'Error',
    message: (
      <>
        <Text>{message}</Text>
      </>
    ),
    color: 'danger',
    autoClose: false,
  })
}

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      handleError(error)
    },
  }),
})
export const QueryClientWrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)
