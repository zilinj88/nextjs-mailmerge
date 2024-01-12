'use client'

import { Button, Group, Stack, Text } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { handleError } from '~/lib/handle-error'
import { useAppDataStore } from '~/lib/hooks'
import { parseFile } from '~/lib/parse'
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
      try {
        const data = await parseFile(file)
        useAppDataStore.getState().setData(data)
        router.push('?tab=template')
      } catch (e) {
        handleError(e)
      } finally {
        setLoading(false)
      }
    },
    [router]
  )
  return { isLoading, parseAsync }
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
        <Text size='xl' inline c='dimmed'>
          Drop CSV/TSV file here
        </Text>
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
