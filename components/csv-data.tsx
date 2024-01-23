'use client'

import { Button, Group, Stack, Text, Tooltip } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useAppDataStore } from '~/lib/hooks'
import { InvalidEmailsError, parseFile } from '~/lib/parse'
import { atOrThrow } from '~/lib/util'

const mkSampleFilePath = () => {
  return `${window.location.origin}/sample.csv`
}

/**
 * useQuery cache is annoying handle case of uploading same files,
 * So use this hook
 * @returns
 */
const useParseFile = () => {
  const router = useRouter()
  const [isLoading, setLoading] = useState(false)
  const parseAsync = useCallback(
    async (file: File | string) => {
      setLoading(true)
      useAppDataStore.setState({ error: undefined })
      try {
        const data = await parseFile(file)
        useAppDataStore.getState().setData(data)
        router.push('?tab=template')
      } catch (e) {
        useAppDataStore.setState({ error: e })
      } finally {
        setLoading(false)
      }
    },
    [router]
  )
  return { isLoading, parseAsync }
}

const mkInvalidEmailsErrorLabel = (e: InvalidEmailsError) => {
  return (
    <>
      {e.invalidRows.map(([row, data]) => (
        <div key={row}>{`Invalid email "${data.email}" provided at row ${row + 1}`}</div>
      ))}
    </>
  )
}
const mkErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Failed to parse CSV file'

const InvalidFileErrorComp = () => {
  const error = useAppDataStore((state) => state.error)
  const tooltipContent = useMemo(() => {
    return typeof error === 'object' && error instanceof InvalidEmailsError
      ? mkInvalidEmailsErrorLabel(error)
      : null
  }, [error])
  if (!error) {
    return null
  }
  const content = (
    <Text size='md' c='danger' style={{ pointerEvents: 'all' }}>
      {mkErrorMessage(error)}
    </Text>
  )
  if (tooltipContent) {
    return <Tooltip label={tooltipContent}>{content}</Tooltip>
  }
  return content
}

export const CSVData: React.FC = () => {
  const { isLoading, parseAsync } = useParseFile()
  const openRef = useRef<() => void>(null)

  const onClickUpload = () => {
    openRef.current?.()
  }

  return (
    <Dropzone
      activateOnClick={false}
      onDrop={(files) => parseAsync(atOrThrow(files, 0))}
      openRef={openRef}
      accept={['text/csv', 'text/tab-separated-values']}
      mt={'xl'}
      miw={500}
    >
      <Stack align='center' gap='xl' mih={220} style={{ pointerEvents: 'none' }} justify='center'>
        <Stack align='center' gap='sm'>
          <InvalidFileErrorComp />
          <Text size='xl' inline c='dimmed'>
            Drop CSV/TSV file here
          </Text>
        </Stack>
        <Group style={{ pointerEvents: 'all' }}>
          <Button onClick={onClickUpload} loading={isLoading}>
            Upload
          </Button>
          <Button onClick={() => parseAsync(mkSampleFilePath())} loading={isLoading}>
            Sample Data
          </Button>
        </Group>
      </Stack>
    </Dropzone>
  )
}
