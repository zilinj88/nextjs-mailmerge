import { chunk } from 'lodash'
import { type Observable, catchError, concatMap, delay, from, map, of, retry, zip } from 'rxjs'
import { type UserRow, useAppDataStore, useSendBatchState, useTemplateStore } from '~/lib/hooks'
import { requestGoogleAccessToken } from '~/lib/token'
import { type SendEmailParams, sendEmailAsync } from './email'

const quotaLimit = 2
const sendInterval = 1000

type SendEmailStatus = 'success' | 'error'

// Retry send email observable, this never emits error
const mkSendEmailObservable = (params: SendEmailParams): Observable<SendEmailStatus> =>
  from(sendEmailAsync(params)).pipe(
    retry({
      count: 2,
      delay: 1000,
    }),
    map(() => 'success' as const),
    catchError(() => of('error' as const))
  )

interface MkSlowSendBatchObservableInput {
  users: UserRow[]
  subjectTemplate: string
  mdTemplate: string
}

export interface SendBatchProgress {
  succeed: number
  failed: number
}

export const mkSendBatchObservable = ({
  users,
  subjectTemplate,
  mdTemplate,
}: MkSlowSendBatchObservableInput): Observable<SendBatchProgress> => {
  let succeed = 0
  let failed = 0
  return from(chunk(users, quotaLimit)).pipe(
    // map every chunk to other delayed observable
    concatMap((val) =>
      // use zip to batch send
      zip(
        val.map((user) =>
          mkSendEmailObservable({ user, to: user.email, subjectTemplate, mdTemplate })
        )
      ).pipe(
        map((results) => {
          // accumulate results
          succeed += results.filter((result) => result === 'success').length
          failed += results.filter((result) => result === 'error').length
          return { succeed, failed }
        }),
        // Delay 1000 seconds before next send
        delay(sendInterval)
      )
    )
  )
}

export const sendBatch = async (): Promise<void> => {
  const users = useAppDataStore.getState().data?.rows ?? []
  if (!users.length) {
    return
  }

  await requestGoogleAccessToken()
  const { subjectTemplate, mdTemplate } = useTemplateStore.getState()
  // Initialize sending
  const subscription = mkSendBatchObservable({ users, subjectTemplate, mdTemplate }).subscribe({
    next: (progress) => {
      useSendBatchState.getState().update(progress)
    },
    complete: () => {
      useSendBatchState.getState().finish()
    },
  })
  useSendBatchState.getState().start(users.length, subscription)
}
