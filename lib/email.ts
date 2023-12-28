import { Converter } from 'showdown'
import { type UserRow, useAppDataStore } from '~/lib/hooks'
import { renderTemplate } from '~/lib/util'

interface EmailParams {
  to: string
  subject: string
  body: string
}

const mkEmail = ({ to, subject, body }: EmailParams) => {
  const message =
    'Content-Type: text/html; charset="Utf-8"\r\n' +
    'MIME-Version: 1.0\r\n' +
    `To: ${to}\r\n` +
    `Subject: ${subject}\r\n\r\n` +
    body
  return btoa(message).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const _sendEmail = async ({ to, subject, body }: EmailParams): Promise<void> => {
  const raw = mkEmail({ to, subject, body })
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
  const converter = new Converter()
  const { mdTemplate, subjectTemplate } = useAppDataStore.getState()
  return Promise.all(
    params.map(({ user, to }) => {
      const subject = renderTemplate(subjectTemplate, user)
      const body = converter.makeHtml(renderTemplate(mdTemplate, user))
      return _sendEmail({ to, subject, body })
    })
  ).then(() => {})
}
