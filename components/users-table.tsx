'use client'

import { Radio, Table } from '@mantine/core'
import { useAppDataStore } from '~/lib/hooks'
import { theme } from '~/lib/theme'
import { atOrThrow } from '~/lib/util'

interface UserRowCompProps {
  index: number
}

const selectRow = (index: number) => {
  useAppDataStore.setState({ selectedIndex: index })
}

const UserRowComp: React.FC<UserRowCompProps> = ({ index }) => {
  const data = useAppDataStore((state) => state.data)
  const isSelected = useAppDataStore((state) => state.selectedIndex === index)
  if (!data) {
    return null
  }
  const row = atOrThrow(data.rows, index)
  return (
    <Table.Tr
      key={index}
      bg={isSelected ? theme.colors.blue[0] : undefined}
      onClick={() => selectRow(index)}
    >
      <Table.Td>
        <Radio aria-label='Select user' checked={isSelected} onChange={() => selectRow(index)} />
      </Table.Td>
      {data.columns.map((col, index) => (
        <Table.Td key={index}>{row[col] ?? ''}</Table.Td>
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
