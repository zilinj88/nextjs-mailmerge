import { escape } from 'lodash'
import { marked } from 'marked'

const block = (text: string): string => text + '\n\n'
const escapeBlock = (text: string): string => escape(text) + '\n\n'
const line = (text: string): string => text + '\n'
const inline = (text: string): string => text
const newline = (): string => '\n'
const empty = (): string => ''

export class MarkdownTextRenderer extends marked.Renderer {
  code = escapeBlock
  blockquote = block
  html = empty
  heading = block
  hr = newline
  list = (text: string): string => block(text.trim())
  listitem = line
  checkbox = empty
  paragraph = block
  table = (header: string, body: string): string => line(header + body)
  tablerow = (text: string): string => line(text.trim())
  tablecell = (text: string): string => text + ' '
  // Inline elements
  strong = inline
  em = inline
  codespan = inline
  br = newline
  del = inline
  link = (_0: string, _1: string, text: string): string => text
  image = (_0: string, _1: string, text: string): string => text
  text = inline
  // etc.
  options = {}
}

export const textRenderer = new MarkdownTextRenderer()
