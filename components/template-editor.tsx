'use client'

import { Box, Input, Stack, TextInput } from '@mantine/core'
import MDEditor from '@uiw/react-md-editor'
import React from 'react'
import { useAppDataStore } from '~/lib/hooks'

export const TemplateEditor: React.FC = () => {
  const subjectTemplate = useAppDataStore((state) => state.subjectTemplate)
  const mdTemplate = useAppDataStore((state) => state.mdTemplate)
  return (
    <Stack gap='md' pt='md'>
      <TextInput
        label='Subject template'
        value={subjectTemplate}
        onChange={(event) =>
          useAppDataStore.setState({ subjectTemplate: event.currentTarget.value })
        }
      />
      <Stack gap='2'>
        <Input.Label>Mail body template</Input.Label>
        <Box data-color-mode='light'>
          <MDEditor
            value={mdTemplate}
            onChange={(value) => useAppDataStore.setState({ mdTemplate: value ?? '' })}
            preview='edit'
            height={300}
          />
        </Box>
      </Stack>
    </Stack>
  )
}
