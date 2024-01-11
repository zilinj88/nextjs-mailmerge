'use client'

import { Button, Group, Stack, Text } from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { useAppDataStore } from '~/lib/hooks'
import { parseFile } from '~/lib/parse'
import { atOrThrow } from '~/lib/util'

const mkSampleFilePath = () => {
  return `${window.location.origin}/sample.csv`
}

export const CSVData: React.FC = () => {
  const openRef = useRef<() => void>(null)
  const [file, setFile] = useState<File | string>()
  const router = useRouter()
  const { data, isLoading } = useQuery({
    queryKey: [file],
    enabled: !!file,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    queryFn: () => parseFile(file!),
    staleTime: Infinity,
    cacheTime: Infinity,
  })
  const client = useQueryClient()
  const navigateToTemplate = useCallback(() => {
    router.push('?tab=template')
  }, [router])

  useEffect(() => {
    if (data) {
      useAppDataStore.setState({ data })
      navigateToTemplate()
    }
  }, [data, navigateToTemplate])

  const onClickUpload = () => {
    openRef.current?.()
  }

  const checkIfCached = (key: string | File) => {
    const cached = client.getQueryData([key])
    if (cached) {
      // This is necessary because when the same file is selected, and the
      // queryResult.data does not change it won't navigate to template page.
      navigateToTemplate()
    }
  }

  const onChangeFile = (file: File | string) => {
    setFile(file)
    checkIfCached(file)
  }

  return (
    <Dropzone
      activateOnClick={false}
      onDrop={(files) => onChangeFile(atOrThrow(files, 0))}
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
          <Button onClick={() => onChangeFile(mkSampleFilePath())} loading={isLoading}>
            Sample Data
          </Button>
        </Group>
      </Stack>
    </Dropzone>
  )
}
