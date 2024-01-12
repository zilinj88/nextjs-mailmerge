'use client'

import type { PropsWithChildren } from 'react'
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from 'react-query'
import { handleError } from '~/lib/handle-error'

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      handleError(error)
    },
  }),
  queryCache: new QueryCache({
    onError: (error) => {
      handleError(error)
    },
  }),
})
export const QueryClientWrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)
