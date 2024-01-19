import {
  Button,
  Group,
  Loader,
  Modal,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core'
import { IconCircleCheck, IconX } from '@tabler/icons-react'
import { useMemo } from 'react'
import { useSendBatchState } from '~/lib/hooks'

export interface ProgressData {
  total: number
  current: number
}

const leftSectionSize = 64
export const SendBatchStatusModal: React.FC = () => {
  const status = useSendBatchState((state) => state.status)
  const finished = useSendBatchState((state) => state.succeed + state.failed)
  const succeed = useSendBatchState((state) => state.succeed)
  const failed = useSendBatchState((state) => state.failed)
  const total = useSendBatchState((state) => state.total)

  const displayText = useMemo(() => {
    switch (status) {
      case 'cancelled':
        return 'Cancelled'
      case 'finished':
        return 'Finished'
      case 'sending':
        return 'Sending...'
      case 'idle':
        return ''
    }
  }, [status])

  const leftSection = useMemo(() => {
    switch (status) {
      case 'cancelled':
        return (
          <ThemeIcon color='danger' display='contents'>
            <IconX size={leftSectionSize} />
          </ThemeIcon>
        )
      case 'finished':
        return (
          <ThemeIcon color='go' display='contents'>
            <IconCircleCheck size={leftSectionSize} />
          </ThemeIcon>
        )
      case 'sending':
        return <Loader size={leftSectionSize} />
      case 'idle':
        return null
    }
  }, [status])

  if (status === 'idle') {
    return
  }

  const progress = (total > 0 ? finished / total : 0) * 100

  return (
    <Modal
      opened
      onClose={() => {}}
      title={<Title order={3}>Batch send email</Title>}
      withCloseButton={false}
    >
      <Stack gap={'sm'}>
        <Group justify='center'>
          {leftSection}
          <Text size='xl' ta='center' c='dimmed'>
            {displayText}
          </Text>
        </Group>
        <Group>
          <Text>
            Sent: {finished}/{total}{' '}
            <small>
              (Success: {succeed}, Failed: {failed})
            </small>
          </Text>
        </Group>
        <Progress value={progress} animated={status === 'sending'}></Progress>
        {(status === 'cancelled' || status === 'finished') && (
          <Button
            onClick={() => {
              useSendBatchState.getState().clear()
            }}
          >
            Dismiss
          </Button>
        )}
        {status === 'sending' && (
          <Button
            onClick={() => {
              useSendBatchState.getState().cancel()
            }}
          >
            Cancel
          </Button>
        )}
      </Stack>
    </Modal>
  )
}
