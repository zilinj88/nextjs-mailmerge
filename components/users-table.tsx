'use client'

import { Radio, Table } from '@mantine/core'
import { type UserRow, useAppDataStore } from '~/lib/hooks'
import { theme } from '~/lib/theme'
import { atOrThrow } from '~/lib/util'

interface UserRowCompProps {
  index: number
}

const selectUser = (user: UserRow) => {
  useAppDataStore.setState({ selectedUser: user })
}

const UserRowComp: React.FC<UserRowCompProps> = ({ index }) => {
  const data = useAppDataStore((state) => state.data)
  const user = atOrThrow(data?.rows ?? [], index)
  const isSelected = useAppDataStore(
    (state) => state.selectedUser === atOrThrow(data?.rows ?? [], index)
  )
  if (!data) {
    return null
  }

  return (
    <Table.Tr
      key={index}
      bg={isSelected ? theme.colors.blue[0] : undefined}
      onClick={() => selectUser(user)}
    >
      <Table.Td>
        <Radio aria-label='Select user' checked={isSelected} onChange={() => selectUser(user)} />
      </Table.Td>
      {data.columns.map((col, index) => (
        <Table.Td key={index}>{user[col] ?? ''}</Table.Td>
      ))}
    </Table.Tr>
  )
}

export const UsersTable: React.FC = () => {
  const data = useAppDataStore((state) => state.data)
  if (!data || data.rows.length === 0) {
    return null
  }
  return (
    <Table striped>
      <Table.Thead>
        <Table.Tr>
          <Table.Th />
          {data.columns.map((col, index) => (
            <Table.Th key={index}>{col}</Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.rows.map((row, index) => (
          <UserRowComp key={`row-${index}`} index={index} />
        ))}
      </Table.Tbody>
    </Table>
  )
}
