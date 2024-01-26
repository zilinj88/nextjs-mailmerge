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
import pluralize from 'pluralize'
import React, { useMemo, useState } from 'react'
import { useMutation } from 'react-query'
import { PreviewWarningBadge } from '~/components/preview-warning-tooltip'
import { UsersTable } from '~/components/users-table'
import { sendMeFn } from '~/lib/email'
import {
  useAppDataStore,
  useAttachmentsSize,
  useSendBatchState,
  useTemplateStore,
  useTemplateStoreSafe,
} from '~/lib/hooks'
import promptConfirmAsync from '~/lib/prompt-confirm-async'
import { sendBatch } from '~/lib/send-batch'
import { useUpdatePreviewWarnings } from '~/lib/use-update-preview-warnings'
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

interface PreviewCompProps {
  subject: string
  body: string
}

const PreviewComp: React.FC<PreviewCompProps> = ({ subject, body }) => (
  <Box>
    <Group align='center' mb='xs'>
      <Title order={3}>Preview</Title>
      <PreviewWarningBadge />
    </Group>
    <Stack gap='xl'>
      <Stack gap='xs'>
        <Title order={6}>Subject </Title>
        <Text>{subject}</Text>
      </Stack>
      <Stack data-color-mode='light' gap='xs'>
        <Title order={6}>Body</Title>
        <MDEditor.Markdown source={body} />
      </Stack>
    </Stack>
  </Box>
)

// 25MB
// See https://support.google.com/mail/answer/6584#zippy=%2Cattachment-size-limit
const maxAttachmentSize = 25 * 1024 * 1024

const AttachmentsComp: React.FC = () => {
  const attachments = useAppDataStore((state) => state.attachments)
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
      useAppDataStore.getState().addAttachments(files)
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
                useAppDataStore.getState().removeAttachment(file)
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

const useSubjectBody = () => {
  const subjectTemplate = useTemplateStore((state) => state.subjectTemplate)
  const bodyTemplate = useTemplateStore((state) => state.bodyTemplate)
  const selectedUser = useAppDataStore((state) => state.selectedUser)
  const subject = useMemo(
    () => renderTemplate(subjectTemplate, selectedUser ?? {}),
    [selectedUser, subjectTemplate]
  )
  const body = useMemo(
    () => renderTemplate(bodyTemplate, selectedUser ?? {}),
    [selectedUser, bodyTemplate]
  )

  return useMemo(
    () => ({
      subject,
      body,
    }),
    [subject, body]
  )
}

export const TemplateEditor: React.FC = () => {
  const rows = useAppDataStore((state) => state.data?.rows)
  const sendBatchStatus = useSendBatchState((state) => state.status)
  const sendMeMutation = useMutation(sendMeFn)
  const sendBatchMutation = useMutation(sendBatch)
  const selectedUser = useAppDataStore((state) => state.selectedUser)
  const { subject, body } = useSubjectBody()
  useUpdatePreviewWarnings({ subject, body })

  const beforeSend = async () => {
    const warnings = useAppDataStore.getState().warnings
    if (!warnings.length) {
      return true
    }
    const pluralizedWarning = pluralize('warning', warnings.length)
    const confirm = await promptConfirmAsync({
      title: 'Are you sure?',
      subtitle: (
        <>
          {`There ${pluralize.isPlural(pluralizedWarning) ? 'are' : 'is'} ${
            warnings.length
          } ${pluralizedWarning}.
          Are you sure you want to proceed?`}
        </>
      ),
      confirmText: 'Yes',
      confirmProps: { color: 'danger' },
    })
    return confirm
  }
  const onClickSendMe = async () => {
    if (!selectedUser || !(await beforeSend())) {
      return
    }
    sendMeMutation.mutateAsync(selectedUser)
  }

  const onSendBatch = async () => {
    if (!(await beforeSend())) {
      return
    }
    sendBatchMutation.mutateAsync()
  }

  // Hack: Make sure the Preview & Markdown component read correct from TemplateStore
  const isLoaded = useTemplateStoreSafe((state) => state.isLoaded)
  if (!isLoaded) {
    return null
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
        {isDataAvailable && <PreviewComp subject={subject} body={body} />}
      </SimpleGrid>
      {isDataAvailable && (
        <Stack>
          <Group justify='space-between'>
            <Title order={3}>Users ({rows.length})</Title>
            <Group>
              <Button
                rightSection={sendMeMutation.isSuccess ? '✓' : <PreviewWarningBadge />}
                disabled={!selectedUser}
                loading={isSendingMails}
                onClick={onClickSendMe}
              >
                Send me a sample
              </Button>
              <Button
                rightSection={sendBatchStatus === 'finished' ? '✓' : <PreviewWarningBadge />}
                loading={isSendingMails}
                onClick={onSendBatch}
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
