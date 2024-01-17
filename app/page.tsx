'use client'

import { Button, Container, Group, Stack, Tabs, Text, Title } from '@mantine/core'
import { type JSX } from 'react'
import { useMutation, useQuery } from 'react-query'
import { CSVData } from '~/components/csv-data'
import { TemplateEditor } from '~/components/template-editor'
import { getMyEmail } from '~/lib/email'
import { useGoogleService } from '~/lib/hooks'
import { requestGoogleAccessToken, signOut } from '~/lib/token'
import { useNavigationTabs } from '~/lib/use-navigation-tabs'

const useGetMyEmailQuery = () => {
  const accessToken = useGoogleService((state) => state.token)
  const { data: email } = useQuery({
    queryKey: [accessToken],
    queryFn: () => {
      if (!accessToken) {
        return Promise.resolve('')
      }
      return getMyEmail()
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  })
  return email
}

// User Info Component
const UserInfoComp = () => {
  const accessToken = useGoogleService((state) => state.token)
  const loginMutation = useMutation(requestGoogleAccessToken)
  const isGoogleInitialized = useGoogleService(
    (state) => state.gapiInitialized && state.gisInitialized
  )
  const email = useGetMyEmailQuery()
  const onClickSignOut = () => {
    signOut()
  }

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
  const navigationTabs = useNavigationTabs({
    tabs: ['csv-data', 'template'],
    defaultTab: 'csv-data',
  })

  return (
    <Container size='xl' mt='lg'>
      <Stack gap='md'>
        <Group justify='space-between'>
          <Title order={1}>Mail Merge</Title>
          <UserInfoComp />
        </Group>
        <Tabs {...navigationTabs}>
          <Tabs.List>
            <Tabs.Tab value='csv-data'>CSV Data</Tabs.Tab>
            <Tabs.Tab value='template'>Template</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value='csv-data'>
            <CSVData />
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
