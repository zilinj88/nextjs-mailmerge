import { type ButtonProps, Text } from '@mantine/core'
import { openConfirmModal } from '@mantine/modals'
import React from 'react'

interface PromptConfirmProps {
  title: React.ReactNode
  subtitle: React.ReactNode
  confirmText?: string | undefined
  cancelText?: string | undefined
  cancelProps?: ButtonProps & React.ComponentPropsWithoutRef<'button'>
  confirmProps?: ButtonProps & React.ComponentPropsWithoutRef<'button'>
}

const promptConfirmAsync = ({
  title,
  subtitle,
  confirmText,
  cancelText,
  confirmProps,
  cancelProps,
}: PromptConfirmProps): Promise<boolean> => {
  return new Promise((res) => {
    openConfirmModal({
      title,
      children: <Text size='sm'>{subtitle}</Text>,
      labels: { confirm: confirmText ?? 'Confirm', cancel: cancelText ?? 'Cancel' },
      onConfirm: () => res(true),
      // `onClose` is also called when the user confirms the modal but
      // before it is called, the promise would already resolve with true as
      // `onConfirm` is called first
      onClose: () => res(false),
      confirmProps,
      cancelProps,
    })
  })
}

export default promptConfirmAsync
