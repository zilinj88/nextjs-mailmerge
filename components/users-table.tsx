'use client'

import { Button, Checkbox, FileInput, Menu, Stack, Table, ThemeIcon } from '@mantine/core'
import { IconEye, IconSend, IconSend2 } from '@tabler/icons-react'
import papaparse from 'papaparse'
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
}
const ActionsMenu: React.FC<ActionsButtonsProps> = ({ onPreview, onSend, onSendMe }) => {
  return (
    <Menu>
      <Menu.Target>
        <Button>Actions</Button>
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
  const setData = useAppDataStore((state) => state.setData)
  const onFileChange = async (file: File | null) => {
    if (!file) {
      return
    }
    setData(await parseFile(file))
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

const UserRowComp: React.FC<UserRowCompProps> = ({ index }) => {
  const selectedIndexes = useAppDataStore((state) => state.selectedIndexes)
  const data = useAppDataStore((state) => state.data)
  const toggleSelected = useAppDataStore((state) => state.toggleSelected)
  const isSelected = selectedIndexes.includes(index)
  const openPreviewModal = usePreviewModalStore((state) => state.openModal)
  if (!data) {
    return null
  }
  const row = atOrThrow(data.rows, index)

  const onPreview = () => {
    openPreviewModal(row)
  }
  const onSend = async () => {
    await requestGoogleAccessToken()
    sendEmails([{ user: row, to: row.email }])
  }
  const onSendMe = async () => {
    await requestGoogleAccessToken()
    const { result } = await gapi.client.gmail.users.getProfile({ userId: 'me' })
    if (!result || !result.emailAddress) {
      return
    }
    sendEmails([{ user: row, to: result.emailAddress }])
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
        <ActionsMenu onPreview={onPreview} onSend={onSend} onSendMe={onSendMe} />
      </Table.Td>
    </Table.Tr>
  )
}

const onClickSendBatch = async () => {
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

  return (
    <Stack gap={'sm'} pt='md'>
      <FileInputComp />

      {!!data && data.rows.length > 0 && (
        <>
          <Button
            style={{ alignSelf: 'flex-start' }}
            disabled={selectedRowsCount === 0}
            onClick={() => onClickSendBatch()}
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
