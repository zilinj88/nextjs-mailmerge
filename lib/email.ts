import { marked } from 'marked'
import { type AttachmentOptions, createMimeMessage } from 'mimetext'
import { type UserRow, useTemplateStore } from '~/lib/hooks'
import { MarkdownTextRenderer } from '~/lib/markdown-text-renderer'
import { mkBase64Encoded } from '~/lib/mk-base64-encoded'
import { requestGoogleAccessToken } from '~/lib/token'
import { renderTemplate } from '~/lib/util'

interface EmailParams {
  to: string
  subject: string
  html: string
  text: string
  attachments: AttachmentOptions[]
}

const mkEmail = ({ to, subject, html, text, attachments }: EmailParams) => {
  const message = createMimeMessage()
  message.setSender('me')
  message.setTo(to)
  message.setSubject(subject)
  message.addMessage({
    contentType: 'text/html',
    data: html,
  })
  message.addMessage({
    contentType: 'text/plain',
    data: text,
  })
  attachments.forEach((file) => message.addAttachment(file))
  return message.asEncoded()
}

export interface SendEmailParams {
  user: UserRow
  to: string
  subjectTemplate: string
  bodyTemplate: string
  attachments: AttachmentOptions[]
}

const textRenderer = new MarkdownTextRenderer()
export const sendEmailAsync = async ({
  user,
  to,
  subjectTemplate,
  bodyTemplate,
  attachments,
}: SendEmailParams): Promise<void> => {
  const subject = renderTemplate(subjectTemplate, user)
  const body = renderTemplate(bodyTemplate, user)
  const html = marked(body, { async: false }) as string
  const text = marked(body, { renderer: textRenderer, async: false }) as string
  const raw = mkEmail({ to, subject, html, text, attachments })
  await gapi.client.gmail.users.messages.send({
    userId: 'me',
    resource: { raw },
  })
}

export const getMyEmail = async (): Promise<string> => {
  const { result } = await gapi.client.gmail.users.getProfile({ userId: 'me' })
  if (!result.emailAddress) {
    throw new Error('Failed to get email address')
  }
  return result.emailAddress
}

export const sendMeFn = async (row: UserRow): Promise<void> => {
  await requestGoogleAccessToken()
  const to = await getMyEmail()
  const { bodyTemplate, subjectTemplate, attachments } = useTemplateStore.getState()
  await sendEmailAsync({
    user: row,
    to,
    subjectTemplate,
    bodyTemplate,
    attachments: await Promise.all(attachments.map((file) => mkBase64Encoded(file))),
  })
}
