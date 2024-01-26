import { Badge, Stack, Tooltip } from '@mantine/core'
import pluralize from 'pluralize'
import { useMemo } from 'react'
import { useAppDataStore } from '~/lib/hooks'
import { type PreviewWarning } from '~/lib/use-update-preview-warnings'

const renderWarningDescription = (warning: PreviewWarning) => {
  switch (warning.type) {
    case 'check_link':
      return `The search params in the ${warning.href} does not contain utm fields`
    case 'attachment':
      return 'There are no attachments'
    case 'variable':
      return `The variable "${warning.name}" in ${
        warning.location === 'subject' ? 'subject' : 'body'
      } was not substituted`
  }
}

export const PreviewWarningBadge: React.FC = () => {
  const warnings = useAppDataStore((state) => state.warnings)
  const selectedUser = useAppDataStore((state) => state.selectedUser)
  const pluralizedWarning = pluralize('warning', warnings.length)
  const label = useMemo(() => {
    return (
      <Stack>
        <span>
          {`There ${pluralize.isPlural(pluralizedWarning) ? 'are' : 'is'} ${
            warnings.length
          } ${pluralizedWarning}`}
        </span>
        <ul>
          {warnings.map((warning, index) => (
            <li key={index}>{renderWarningDescription(warning)}</li>
          ))}
        </ul>
      </Stack>
    )
  }, [warnings, pluralizedWarning])
  if (warnings.length === 0 || !selectedUser) {
    return null
  }

  return (
    <Tooltip label={label}>
      <Badge color='danger'>{warnings.length}</Badge>
    </Tooltip>
  )
}
