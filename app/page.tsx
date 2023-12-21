'use client'

import { Container, Stack, Tabs, Title } from '@mantine/core'
import { type JSX } from 'react'
import { TemplateEditor } from '~/components/template-editor'
import { UsersTable } from '~/components/users-table'

const Home = (): JSX.Element => {
  return (
    <Container size='xl' mt='lg'>
      <Stack gap='md'>
        <Title order={1}>Mail Merge</Title>
        <Tabs defaultValue='users'>
          <Tabs.List>
            <Tabs.Tab value='users'>Users</Tabs.Tab>
            <Tabs.Tab value='template'>Template</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='users'>
            <UsersTable />
          </Tabs.Panel>
          <Tabs.Panel value='template'>
            <TemplateEditor />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}

export default Home
