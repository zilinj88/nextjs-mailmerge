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
import { mkBase64Encoded } from '~/lib/mk-base64-encoded'
import { requestGoogleAccessToken } from '~/lib/token'
import { type SendEmailParams, sendEmailAsync } from './email'

type SendEmailStatus = 'success' | 'error'

// Gmail API has a limit of 2.5 messages per second:L
// https://developers.google.com/gmail/api/reference/quota
const delayBetweenSendMs = 500

const retryConfig: RetryConfig = {
  count: 2,
  delay: delayBetweenSendMs,
}

// Retry send email observable, this never emits error
const mkSendEmailObservable = (params: SendEmailParams): Observable<SendEmailStatus> =>
  from(sendEmailAsync(params)).pipe(
    retry(retryConfig),
    map(() => 'success' as const),
    catchError(() => of('error' as const))
  )

interface MkSlowSendBatchObservableInput
  extends Pick<SendEmailParams, 'subjectTemplate' | 'bodyTemplate' | 'attachments'> {
  users: UserRow[]
}

export interface SendBatchProgress {
  succeed: number
  failed: number
}

/*
  Use rxjs to
  1. Implement complicated concurrency easily
  2. Make cancellation easy
*/
export const mkSendBatchObservable = ({
  users,
  subjectTemplate,
  bodyTemplate,
  attachments,
}: MkSlowSendBatchObservableInput): Observable<SendBatchProgress> => {
  let succeed = 0
  let failed = 0
  return from(users).pipe(
    // concat-map every user to send email observable, and then delay 500ms
    concatMap((user) =>
      mkSendEmailObservable({
        user,
        to: user.email,
        subjectTemplate,
        bodyTemplate,
        attachments,
      }).pipe(
        map((result) => {
          if (result === 'success') {
            succeed = succeed + 1
          } else {
            failed = failed + 1
          }
          return { succeed, failed }
        }),
        delay(delayBetweenSendMs)
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
  const { subjectTemplate, bodyTemplate, attachments } = useTemplateStore.getState()
  // Initialize sending
  const subscription = mkSendBatchObservable({
    users,
    subjectTemplate,
    bodyTemplate,
    attachments: await Promise.all(attachments.map((file) => mkBase64Encoded(file))),
  }).subscribe({
    next: (progress) => {
      useSendBatchState.getState().update(progress)
    },
    complete: () => {
      useSendBatchState.getState().finish()
    },
  })
  useSendBatchState.getState().start(users.length, subscription)
}
