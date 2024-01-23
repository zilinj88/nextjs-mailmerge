import papaparse from 'papaparse'
import type { UserRow, UsersData } from '~/lib/hooks'
import { atOrThrow } from '~/lib/util'

const emailRegEx = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/

export class InvalidEmailsError extends Error {
  constructor(public readonly invalidRows: [number, UserRow][]) {
    super(
      'Invalid email provided.  Please make sure that the email address is the first column of your CSV.'
    )
  }
}

export const parseFile = (file: File | string): Promise<UsersData> =>
  new Promise<UsersData>((resolve, reject) => {
    papaparse.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      // Need this to parse remote file too
      download: true,
      complete: (results) => {
        const { meta, data } = results
        const columns = meta.fields
        if (!columns || !columns.length) {
          reject(new Error('Invalid headers provided'))
          return
        }
        // Assume the first column is always the e-mail regardless of the
        // header name
        const rows = data
          .map<UserRow>((v) => ({ ...v, email: v[atOrThrow(columns, 0)] ?? '' }))
          // Filter empty emails
          .filter((r) => r.email)
        if (!rows.length) {
          reject(new Error('No user rows found'))
          return
        }
        const invalidRows = rows
          .map<[number, UserRow]>((row, index) => [index, row])
          .filter(([, row]) => !row.email.match(emailRegEx))
        if (invalidRows.length) {
          reject(new InvalidEmailsError(invalidRows))
        }
        resolve({
          rows,
          columns,
        })
      },
    })
  })
