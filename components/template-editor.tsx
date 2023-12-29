'use client'

import { Box, Input, Stack, TextInput } from '@mantine/core'
import MDEditor from '@uiw/react-md-editor'
import React from 'react'
import { useTemplateStore, useTemplateStoreSafe } from '~/lib/hooks'

export const TemplateEditor: React.FC = () => {
  const subjectTemplate = useTemplateStoreSafe((state) => state.subjectTemplate) ?? ''
  const mdTemplate = useTemplateStoreSafe((state) => state.mdTemplate) ?? ''
  return (
    <Stack gap='md' pt='md'>
      <TextInput
        label='Subject template'
        value={subjectTemplate}
        onChange={(event) =>
          useTemplateStore.setState({ subjectTemplate: event.currentTarget.value })
        }
      />
      <Stack gap='2'>
        <Input.Label>Mail body template</Input.Label>
        <Box data-color-mode='light'>
          <MDEditor
            value={mdTemplate}
            onChange={(value) => useTemplateStore.setState({ mdTemplate: value ?? '' })}
            preview='edit'
            height={300}
          />
        </Box>
      </Stack>
    </Stack>
  )
}
