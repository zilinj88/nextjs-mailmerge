import { Box, Group, Modal, Stack, Text, Title } from '@mantine/core'
import MDEditor from '@uiw/react-md-editor'
import { useMemo } from 'react'
import { usePreviewModalStore, useTemplateStoreSafe } from '~/lib/hooks'
import { renderTemplate } from '~/lib/util'

export const PreviewModal: React.FC = () => {
  const opened = usePreviewModalStore((state) => state.opened)
  const closeModal = usePreviewModalStore((state) => state.closeModal)
  const data = usePreviewModalStore((state) => state.data)
  const subjectTemplate = useTemplateStoreSafe((state) => state.subjectTemplate) ?? ''
  const mdTemplate = useTemplateStoreSafe((state) => state.mdTemplate) ?? ''

  const renderedSubject = useMemo(
    () => renderTemplate(subjectTemplate, data ?? {}),
    [data, subjectTemplate]
  )
  const renderedBody = useMemo(() => renderTemplate(mdTemplate, data ?? {}), [data, mdTemplate])

  return (
    <Modal
      opened={opened}
      onClose={() => closeModal()}
      centered
      title={
        <Box>
          <Title order={5}>Preview Email</Title>
        </Box>
      }
      miw={300}
      size='auto'
      overlayProps={{
        backgroundOpacity: 0.5,
        color: 'gray',
        blur: 3,
      }}
    >
      <Stack>
        <Group>
          <Title order={6}>Subject: </Title>
          <Text>{renderedSubject}</Text>
        </Group>
        <Title order={6}>Body</Title>
        <Box data-color-mode='light'>
          <MDEditor.Markdown source={renderedBody} />
        </Box>
      </Stack>
    </Modal>
  )
}
