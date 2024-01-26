import { marked } from 'marked'
import { useEffect } from 'react'
import { useAppDataStore } from '~/lib/hooks'
import { textRenderer } from '~/lib/markdown-text-renderer'

interface UsePreviewWarningsParams {
  subject: string
  body: string
}

const attachmentRegExp = /\battachment(?:s)?|attached\b/
const variableRegExp = /{{[^{}]+}}/g

interface CheckLinkWarning {
  type: 'check_link'
  href: string
}

interface AttachmentWarning {
  type: 'attachment'
}

interface VariableWarning {
  type: 'variable'
  name: string
  location: 'subject' | 'body'
}

export type PreviewWarning = CheckLinkWarning | AttachmentWarning | VariableWarning

const mkVariableWarnings = (text: string, location: VariableWarning['location']) =>
  text.match(variableRegExp)?.map((match) => {
    const name = match.slice(2, -2)
    return { type: 'variable' as const, location, name }
  }) ?? []

export const useUpdatePreviewWarnings = ({ subject, body }: UsePreviewWarningsParams): void => {
  const attachments = useAppDataStore((state) => state.attachments)
  // Update debounced warnings state with 300ms delay
  useEffect(() => {
    const timeout = setTimeout(() => {
      const warnings: PreviewWarning[] = []
      // Links check
      const textBody = marked(body, {
        renderer: textRenderer,
        walkTokens: (token) => {
          if (token.type === 'link') {
            const searchParams = new URL(token.href).searchParams
            const utmSource = searchParams.get('utm_source')
            const utmMedium = searchParams.get('utm_medium')
            const utmCampaign = searchParams.get('utm_campaign')
            if (!utmSource || !utmMedium || !utmCampaign) {
              warnings.push({
                type: 'check_link',
                href: token.href,
              })
            }
          }
        },
      }) as string

      // Attachments check
      if (textBody.match(attachmentRegExp) && !attachments.length) {
        // Add warning that no file attached
        warnings.push({
          type: 'attachment',
        })
      }

      // Subject & Body
      warnings.push(...mkVariableWarnings(subject, 'subject'))
      warnings.push(...mkVariableWarnings(textBody, 'body'))

      // Update warnings
      useAppDataStore.setState({ warnings })
    }, 300)
    return () => {
      clearTimeout(timeout)
    }
  }, [body, subject, attachments])
}
