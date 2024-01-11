import papaparse from 'papaparse'
import type { UserRow, UsersData } from '~/lib/hooks'
import { atOrThrow } from '~/lib/util'

export const parseFile = (file: File | string): Promise<UsersData> =>
  new Promise<UsersData>((resolve, reject) => {
    papaparse.parse<Record<string, string>>(file, {
      header: true,
      // Need this to parse remote file too
      download: true,
      complete: (results) => {
        const { meta, data } = results
        const columns = meta.fields
        if (!columns || !columns.length) {
          reject(new Error('Invalid headers provided'))
          return
        }
        resolve({
          columns,
          // Assume the first column is always the e-mail regardless of the
          // header name
          rows: data
            .map<UserRow>((v) => ({ ...v, email: v[atOrThrow(columns, 0)] ?? '' }))
            // Filter empty emails
            .filter((r) => r.email),
        })
      },
    })
  })
