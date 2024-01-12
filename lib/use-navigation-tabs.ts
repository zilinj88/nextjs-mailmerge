import type { TabsProps } from '@mantine/core'
import { useQueryState } from 'nuqs'
import React, { useEffect } from 'react'

type TabValues = string | null
interface UseNavigationTabsRtn extends Pick<TabsProps, 'value' | 'onChange'> {}

export const useNavigationTabs = <T extends string>({
  tabs,
  defaultTab,
}: {
  tabs: [T, T, ...T[]]
  defaultTab: T
}): UseNavigationTabsRtn => {
  if (!tabs.includes(defaultTab))
    throw new Error(`Default tab must be included in tabs array: ${defaultTab} not in [${tabs}]`)
  const [tab, setTab] = useQueryState('tab')

  const onChange = React.useCallback(
    (tab: TabValues) => {
      setTab(tab ?? defaultTab)
    },
    [defaultTab, setTab]
  )

  // add tab to URL if not present
  useEffect(() => {
    if (!tab) {
      // Use replace here to avoid repeatedly setting the route when the user presses BACK in the browser
      onChange(defaultTab)
    }
  }, [tab, defaultTab, onChange])

  return { onChange, value: tab ?? defaultTab }
}

export type UseNavigationTabs = typeof useNavigationTabs
