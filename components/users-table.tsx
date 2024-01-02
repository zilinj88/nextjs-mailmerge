'use client'

import { Button, Checkbox, FileInput, Menu, Stack, Table, ThemeIcon } from '@mantine/core'
import { IconEye, IconSend, IconSend2 } from '@tabler/icons-react'
import papaparse from 'papaparse'
import { useMutation } from 'react-query'
import { PreviewModal } from '~/components/preview-modal'
import { sendEmails } from '~/lib/email'
import { type UserRow, type UsersData, useAppDataStore, usePreviewModalStore } from '~/lib/hooks'
import { theme } from '~/lib/theme'
import { requestGoogleAccessToken } from '~/lib/token'
import { atOrThrow } from '~/lib/util'

const parseFile = async (file: File) =>
  new Promise<UsersData>((resolve, reject) => {
    papaparse.parse<Record<string, string>>(file, {
      header: true,
      complete: (results) => {
        const { meta, data } = results
        const columns = meta.fields
        if (!columns || !columns.length) {
          reject(new Error('Invalid headers provided'))
          return
        }
        resolve({
          columns,
          // Assume the first column is always the e-mail regardless of the
          // header name
          rows: data.map<UserRow>((v) => ({ ...v, email: v[atOrThrow(columns, 0)] ?? '' })),
        })
      },
    })
  })

interface ActionsButtonsProps {
  onPreview: () => void
  onSend: () => void
  onSendMe: () => void
  loading: boolean
}
const ActionsMenu: React.FC<ActionsButtonsProps> = ({ onPreview, onSend, onSendMe, loading }) => {
  return (
    <Menu>
      <Menu.Target>
        <Button loading={loading}>Actions</Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={
            <ThemeIcon>
              <IconEye />
            </ThemeIcon>
          }
          onClick={() => onPreview()}
        >
          Preview
        </Menu.Item>
        <Menu.Item
          leftSection={
            <ThemeIcon>
              <IconSend />
            </ThemeIcon>
          }
          onClick={() => onSend()}
        >
          Send
        </Menu.Item>
        <Menu.Item
          leftSection={
            <ThemeIcon>
              <IconSend2 />
            </ThemeIcon>
          }
          onClick={() => onSendMe()}
        >
          Send me sample
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}

const FileInputComp: React.FC = () => {
  const parseFileMutation = useMutation(async (file: File) => {
    const data = await parseFile(file)
    useAppDataStore.setState({ data })
  })
  const onFileChange = async (file: File | null) => {
    if (!file) {
      return
    }
    await parseFileMutation.mutateAsync(file)
  }
  return (
    <FileInput
      accept='.csv, .tsv'
      placeholder='Select csv/tsv files'
      onChange={onFileChange}
      label='Users File'
    />
  )
}

interface UserRowCompProps {
  index: number
}

const sendFn = async (row: UserRow) => {
  await requestGoogleAccessToken()
  await sendEmails([{ user: row, to: row.email }])
}

const sendMeFn = async (row: UserRow) => {
  await requestGoogleAccessToken()
  const { result } = await gapi.client.gmail.users.getProfile({ userId: 'me' })
  if (!result.emailAddress) {
    throw new Error('')
  }
  sendEmails([{ user: row, to: result.emailAddress }])
}

const UserRowComp: React.FC<UserRowCompProps> = ({ index }) => {
  const selectedIndexes = useAppDataStore((state) => state.selectedIndexes)
  const data = useAppDataStore((state) => state.data)
  const toggleSelected = useAppDataStore((state) => state.toggleSelected)
  const isSelected = selectedIndexes.includes(index)
  const openPreviewModal = usePreviewModalStore((state) => state.openModal)
  const sendMutation = useMutation(sendFn)
  const sendMeMutation = useMutation(sendMeFn)

  if (!data) {
    return null
  }
  const row = atOrThrow(data.rows, index)

  const onPreview = () => {
    openPreviewModal(row)
  }

  return (
    <Table.Tr key={index} bg={isSelected ? theme.colors.blue[0] : undefined}>
      <Table.Td>
        <Checkbox
          aria-label='Select user'
          checked={isSelected}
          onChange={() => {
            toggleSelected(index)
          }}
        />
      </Table.Td>
      {data.columns.map((col, index) => (
        <Table.Td key={index}>{row[col] ?? ''}</Table.Td>
      ))}
      <Table.Td>
        <ActionsMenu
          onPreview={onPreview}
          onSend={() => sendMutation.mutateAsync(row)}
          onSendMe={() => sendMeMutation.mutateAsync(row)}
          loading={sendMutation.isLoading || sendMeMutation.isLoading}
        />
      </Table.Td>
    </Table.Tr>
  )
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

export const UsersTable: React.FC = () => {
  const data = useAppDataStore((state) => state.data)
  const allSelected = useAppDataStore((state) => state.selectedIndexes.length === data?.rows.length)
  const selectedRowsCount = useAppDataStore((state) => state.selectedIndexes.length)
  const setAllSelected = useAppDataStore((state) => state.setAllSelected)
  const sendBatchMutation = useMutation(sendBatchFn)

  return (
    <Stack gap={'sm'} pt='md'>
      <FileInputComp />

      {!!data && data.rows.length > 0 && (
        <>
          <Button
            style={{ alignSelf: 'flex-start' }}
            disabled={selectedRowsCount === 0}
            onClick={() => sendBatchMutation.mutateAsync()}
            loading={sendBatchMutation.isLoading}
          >
            {selectedRowsCount > 0 ? `Send ${selectedRowsCount} email(s)` : 'No rows selected'}
          </Button>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    aria-label='Select all'
                    checked={allSelected}
                    onChange={(event) => setAllSelected(event.target.checked)}
                  />
                </Table.Th>
                {data.columns.map((col, index) => (
                  <Table.Th key={index}>{col}</Table.Th>
                ))}
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.rows.map((row, index) => (
                <UserRowComp key={`row-${index}`} index={index} />
              ))}
            </Table.Tbody>
          </Table>
        </>
      )}
      <PreviewModal />
    </Stack>
  )
}
