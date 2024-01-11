'use client'

import { Button, Container, Group, Stack, Tabs, Text, Title } from '@mantine/core'
import { type JSX, useEffect, useState } from 'react'
import { useMutation } from 'react-query'
import { TemplateEditor } from '~/components/template-editor'
import { UsersTable } from '~/components/users-table'
import { getMyEmail } from '~/lib/email'
import { useGoogleService } from '~/lib/hooks'
import { requestGoogleAccessToken, signOut } from '~/lib/token'

// User Info Component
const UserInfoComp = () => {
  const accessToken = useGoogleService((state) => state.token)
  const loginMutation = useMutation(requestGoogleAccessToken)
  const isGoogleInitialized = useGoogleService(
    (state) => state.gapiInitialized && state.gisInitialized
  )
  const [email, setEmail] = useState('')
  const onClickSignOut = () => {
    signOut()
  }
  useEffect(() => {
    if (accessToken) {
      getMyEmail().then((email) => setEmail(email))
    } else {
      setEmail('')
    }
  }, [accessToken])

  if (!accessToken) {
    return (
      <Button
        onClick={() => loginMutation.mutateAsync()}
        loading={loginMutation.isLoading}
        disabled={!isGoogleInitialized}
      >
        Sign in
      </Button>
    )
  }
  return (
    <Group>
      {!!email && (
        <Text size='sm' c='gray'>
          Signed in as {email}
        </Text>
      )}
      <Button onClick={() => onClickSignOut()}>Sign out</Button>
    </Group>
  )
}

const Home = (): JSX.Element => {
  return (
    <Container size='xl' mt='lg'>
      <Stack gap='md'>
        <Group justify='space-between'>
          <Title order={1}>Mail Merge</Title>
          <UserInfoComp />
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
