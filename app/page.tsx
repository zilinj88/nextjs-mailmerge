'use client'

import { Button, Container, Group, Stack, Tabs, Title } from '@mantine/core'
import { type JSX } from 'react'
import { TemplateEditor } from '~/components/template-editor'
import { UsersTable } from '~/components/users-table'
import { useGoogleService } from '~/lib/hooks'

const Home = (): JSX.Element => {
  const accessToken = useGoogleService((state) => state.token)
  return (
    <Container size='xl' mt='lg'>
      <Stack gap='md'>
        <Group justify='space-between'>
          <Title order={1}>Mail Merge</Title>
          {!!accessToken && <Button>Sign out</Button>}
        </Group>
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
