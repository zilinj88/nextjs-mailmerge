'use client'

import {
  Box,
  Button,
  Group,
  Input,
  Pill,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { Dropzone } from '@mantine/dropzone'
import MDEditor from '@uiw/react-md-editor'
import React, { useMemo, useState } from 'react'
import { useMutation } from 'react-query'
import { UsersTable } from '~/components/users-table'
import { sendMeFn } from '~/lib/email'
import {
  type UserRow,
  useAppDataStore,
  useAttachmentsSize,
  useSendBatchState,
  useTemplateStore,
  useTemplateStoreSafe,
} from '~/lib/hooks'
import { sendBatch } from '~/lib/send-batch'
import { readableFileSize, renderTemplate } from '~/lib/util'

const EditorComp: React.FC = () => {
  const subjectTemplate = useTemplateStore((state) => state.subjectTemplate)
  const bodyTemplate = useTemplateStore((state) => state.bodyTemplate)
  const [mdValue, setMdValue] = useState(bodyTemplate)
  const attachmentsSize = useAttachmentsSize()
  return (
    <Stack gap='xl'>
      <TextInput
        label='Subject template'
        defaultValue={subjectTemplate}
        onChange={(event) =>
          useTemplateStore.setState({ subjectTemplate: event.currentTarget.value })
        }
      />
      <Stack gap={2}>
        <Input.Label>Mail body template</Input.Label>
        <Box data-color-mode='light'>
          <MDEditor
            value={mdValue}
            onChange={(value) => {
              setMdValue(value ?? '')
              useTemplateStore.setState({ bodyTemplate: value ?? '' })
            }}
            preview='edit'
          />
        </Box>
      </Stack>
      <Stack gap={'xs'}>
        <Input.Label>Attachments ({readableFileSize(attachmentsSize)})</Input.Label>
        <AttachmentsComp />
      </Stack>
    </Stack>
  )
}

const PreviewComp: React.FC<{
  data?: UserRow
}> = ({ data }) => {
  const subjectTemplate = useTemplateStore((state) => state.subjectTemplate)
  const bodyTemplate = useTemplateStore((state) => state.bodyTemplate)

  const renderedSubject = useMemo(
    () => renderTemplate(subjectTemplate, data ?? {}),
    [data, subjectTemplate]
  )
  const renderedBody = useMemo(() => renderTemplate(bodyTemplate, data ?? {}), [data, bodyTemplate])
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

// 25MB
// See https://support.google.com/mail/answer/6584#zippy=%2Cattachment-size-limit
const maxAttachmentSize = 25 * 1024 * 1024

const AttachmentsComp: React.FC = () => {
  const attachments = useTemplateStore((state) => state.attachments)
  const attachmentsSize = useAttachmentsSize()
  const remainingSize = maxAttachmentSize - attachmentsSize
  const [dropErrorMessage, setDropErrorMessage] = useState<string>()

  const onDropFiles = React.useCallback(
    (files: File[]) => {
      const addedSize = files.reduce((size, file) => size + file.size, 0)
      if (addedSize + attachmentsSize > maxAttachmentSize) {
        setDropErrorMessage(`Exceeded maximum remaining limit`)
        return
      }
      setDropErrorMessage(undefined)
      useTemplateStore.getState().addAttachments(files)
    },
    [attachmentsSize]
  )

  return (
    <>
      {attachments.length > 0 && (
        <Group wrap='wrap' gap='xs'>
          {attachments.map((file, index) => (
            <Pill
              key={`${file.name}-${index}`}
              withRemoveButton
              onRemove={() => {
                useTemplateStore.getState().removeAttachment(file)
              }}
            >
              {`${file.name} - ${readableFileSize(file.size)}`}
            </Pill>
          ))}
        </Group>
      )}
      <Dropzone
        onDrop={onDropFiles}
        maxSize={remainingSize}
        disabled={remainingSize <= 0}
        style={remainingSize > 0 ? {} : { cursor: 'not-allowed' }}
      >
        <Stack align='center' mih={100} justify='center'>
          {dropErrorMessage && (
            <Text size='sm' inline c='danger'>
              {dropErrorMessage}
            </Text>
          )}
          <Text size='xl' inline c='dimmed'>
            {remainingSize > 0
              ? `Drop attachments (Remaining: ${readableFileSize(remainingSize)})`
              : 'Maximum attachments size reached'}
          </Text>
        </Stack>
      </Dropzone>
    </>
  )
}

export const TemplateEditor: React.FC = () => {
  const rows = useAppDataStore((state) => state.data?.rows)
  const selectedIndex = useAppDataStore((state) => state.selectedIndex)
  const currentUser = typeof selectedIndex === 'number' ? rows?.at(selectedIndex) : undefined
  const sendBatchStatus = useSendBatchState((state) => state.status)
  const sendMeMutation = useMutation(sendMeFn)
  const sendBatchMutation = useMutation(sendBatch)

  // Hack: Make sure the Preview & Markdown component read correct from TemplateStore
  const isLoaded = useTemplateStoreSafe((state) => state.isLoaded)
  if (!isLoaded) {
    return null
  }

  const onClickSendMe = () => {
    if (!currentUser) {
      return
    }
    sendMeMutation.mutateAsync(currentUser)
  }

  const isDataAvailable = rows && rows.length > 0
  const isSendingMails =
    sendMeMutation.isLoading || sendBatchStatus === 'sending' || sendBatchMutation.isLoading
  return (
    <Stack p='md' gap={'xl'}>
      <SimpleGrid cols={{ base: 1, md: 2 }} verticalSpacing='xl' spacing={'xl'}>
        <Box>
          <Title order={3} mb='xs'>
            Edit
          </Title>
          <EditorComp />
        </Box>
        {isDataAvailable && (
          <Box>
            <Title order={3} mb='xs'>
              Preview
            </Title>
            <PreviewComp data={currentUser} />
          </Box>
        )}
      </SimpleGrid>
      {isDataAvailable && (
        <Stack>
          <Group justify='space-between'>
            <Title order={3}>Users ({rows.length})</Title>
            <Group>
              <Button
                rightSection={sendMeMutation.isSuccess ? '✓' : undefined}
                disabled={!currentUser}
                loading={isSendingMails}
                onClick={onClickSendMe}
              >
                Send me a sample
              </Button>
              <Button
                rightSection={sendBatchStatus === 'finished' ? '✓' : undefined}
                loading={isSendingMails}
                onClick={() => sendBatchMutation.mutateAsync()}
              >
                Send to everyone
              </Button>
            </Group>
          </Group>
          <UsersTable />
        </Stack>
      )}
    </Stack>
  )
}
