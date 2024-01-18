import {
  type Observable,
  type RetryConfig,
  catchError,
  concatMap,
  delay,
  from,
  map,
  of,
  retry,
} from 'rxjs'
import { type UserRow, useAppDataStore, useSendBatchState, useTemplateStore } from '~/lib/hooks'
import { requestGoogleAccessToken } from '~/lib/token'
import { type SendEmailParams, sendEmailAsync } from './email'

type SendEmailStatus = 'success' | 'error'

const retryConfig: RetryConfig = {
  count: 2,
  delay: 500,
}

// Retry send email observable, this never emits error
const mkSendEmailObservable = (params: SendEmailParams): Observable<SendEmailStatus> =>
  from(sendEmailAsync(params)).pipe(
    retry(retryConfig),
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
  return from(users).pipe(
    concatMap((user) =>
      mkSendEmailObservable({
        user,
        to: user.email,
        subjectTemplate,
        mdTemplate,
      }).pipe(
        map((result) => {
          if (result === 'success') {
            succeed = succeed + 1
          } else {
            failed = failed + 1
          }
          return { succeed, failed }
        }),
        delay(500)
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
