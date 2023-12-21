'use client'

import { Box, Input, Stack, TextInput } from '@mantine/core'
import MDEditor from '@uiw/react-md-editor'
import React from 'react'

export const TemplateEditor: React.FC = () => {
  const [value, setValue] = React.useState<string | undefined>('')
  return (
    <Stack gap='md' pt='md'>
      <TextInput label='Subject template' />
      <Stack gap='2'>
        <Input.Label>Mail body template</Input.Label>
        <Box data-color-mode='light'>
          <MDEditor value={value} onChange={setValue} preview='edit' height={300} />
        </Box>
      </Stack>
    </Stack>
  )
}
