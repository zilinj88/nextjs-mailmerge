import { marked } from 'marked'
import { createMimeMessage } from 'mimetext'
import { type UserRow, useTemplateStore } from '~/lib/hooks'
import { MarkdownTextRenderer } from '~/lib/markdown-text-renderer'
import { requestGoogleAccessToken } from '~/lib/token'
import { renderTemplate } from '~/lib/util'

interface EmailParams {
  to: string
  subject: string
  html: string
  text: string
}

const mkEmail = ({ to, subject, html, text }: EmailParams) => {
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
  return message.asEncoded()
}

export interface SendEmailParams {
  user: UserRow
  to: string
  subjectTemplate: string
  mdTemplate: string
}

const textRenderer = new MarkdownTextRenderer()
export const sendEmailAsync = async ({
  user,
  to,
  subjectTemplate,
  mdTemplate,
}: SendEmailParams): Promise<void> => {
  const subject = renderTemplate(subjectTemplate, user)
  const md = renderTemplate(mdTemplate, user)
  const html = marked(md, { async: false }) as string
  const text = marked(md, { renderer: textRenderer, async: false }) as string
  const raw = mkEmail({ to, subject, html, text })
  await gapi.client.gmail.users.messages.send({
    userId: 'me',
    resource: { raw },
  })
}

interface SendEmailParam {
  user: UserRow
  to: string
}

export const sendEmails = async (params: SendEmailParam[]): Promise<void> => {
  const { mdTemplate, subjectTemplate } = useTemplateStore.getState()
  return Promise.all(
    params.map(({ user, to }) => {
      return sendEmailAsync({ user, to, subjectTemplate, mdTemplate })
    })
  ).then(() => {})
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
  const { mdTemplate, subjectTemplate } = useTemplateStore.getState()
  await sendEmailAsync({ user: row, to, subjectTemplate, mdTemplate })
}
