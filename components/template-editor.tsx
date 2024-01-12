'use client'

import { Box, Button, Group, Input, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core'
import MDEditor from '@uiw/react-md-editor'
import React, { useMemo } from 'react'
import { useMutation } from 'react-query'
import { UsersTable } from '~/components/users-table'
import { sendEmails } from '~/lib/email'
import { type UserRow, useAppDataStore, useTemplateStore, useTemplateStoreSafe } from '~/lib/hooks'
import { requestGoogleAccessToken } from '~/lib/token'
import { atOrThrow, renderTemplate } from '~/lib/util'

const EditorComp: React.FC = () => {
  const subjectTemplate = useTemplateStoreSafe((state) => state.subjectTemplate) ?? ''
  const mdTemplate = useTemplateStoreSafe((state) => state.mdTemplate) ?? ''
  return (
    <Stack gap='xl'>
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
          />
        </Box>
      </Stack>
    </Stack>
  )
}

const PreviewComp: React.FC<{
  data?: UserRow
}> = ({ data }) => {
  const subjectTemplate = useTemplateStoreSafe((state) => state.subjectTemplate) ?? ''
  const mdTemplate = useTemplateStoreSafe((state) => state.mdTemplate) ?? ''

  const renderedSubject = useMemo(
    () => renderTemplate(subjectTemplate, data ?? {}),
    [data, subjectTemplate]
  )
  const renderedBody = useMemo(() => renderTemplate(mdTemplate, data ?? {}), [data, mdTemplate])
  return (
    <Stack gap='xl'>
      <Stack gap='xs'>
        <Title order={6}>Subject </Title>
        <Text>{renderedSubject}</Text>
      </Stack>
      <Stack data-color-mode='light' gap='xs'>
        <Title order={6}>Body</Title>
        <MDEditor.Markdown source={renderedBody} />
      </Stack>
    </Stack>
  )
}

const sendMeFn = async (row: UserRow) => {
  await requestGoogleAccessToken()
  const { result } = await gapi.client.gmail.users.getProfile({ userId: 'me' })
  if (!result.emailAddress) {
    throw new Error('')
  }
  sendEmails([{ user: row, to: result.emailAddress }])
}

const sendBatchFn = async () => {
  const { data, selectedIndexes } = useAppDataStore.getState()
  if (!data || selectedIndexes.length === 0) {
    return
  }
  const params = selectedIndexes.map((i) => {
    const user = atOrThrow(data.rows, i)
    return { user, to: user.email }
  })
  await requestGoogleAccessToken()
  await sendEmails(params)
}

export const TemplateEditor: React.FC = () => {
  const rows = useAppDataStore((state) => state.data?.rows)
  const selectedIndex = useAppDataStore((state) => state.selectedIndex)
  const currentUser = typeof selectedIndex === 'number' ? rows?.at(selectedIndex) : undefined
  const sendMeMutation = useMutation(sendMeFn)
  const sendBatchMutation = useMutation(sendBatchFn)

  const onClickSendMe = () => {
    if (!currentUser) {
      return
    }
    sendMeMutation.mutateAsync(currentUser)
  }

  return (
    <Stack p='md' gap={'xl'}>
      <SimpleGrid cols={{ base: 1, md: 2 }} verticalSpacing='xl' spacing={'xl'}>
        <Box>
          <Title order={3} mb='xs'>
            Edit
          </Title>
          <EditorComp />
        </Box>
        <Box>
          <Title order={3} mb='xs'>
            Preview
          </Title>
          <PreviewComp data={currentUser} />
        </Box>
      </SimpleGrid>
      <Stack>
        <Group justify='space-between'>
          <Title order={3}>Users</Title>
          <Group>
            <Button
              disabled={!currentUser}
              loading={sendMeMutation.isLoading}
              onClick={onClickSendMe}
            >
              Send me a sample
            </Button>
            <Button
              disabled={!rows || !rows.length}
              loading={sendBatchMutation.isLoading}
              onClick={() => sendBatchMutation.mutateAsync()}
            >
              Send to everyone
            </Button>
          </Group>
        </Group>
        <UsersTable />
      </Stack>
    </Stack>
  )
}
