import { Text } from '@mantine/core'
import { showNotification } from '@mantine/notifications'

export const handleError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : 'Unknown error'
  return showNotification({
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
