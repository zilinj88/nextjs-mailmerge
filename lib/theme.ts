'use client'

import {
  Button,
  DEFAULT_THEME,
  Menu,
  ThemeIcon,
  createTheme,
  mergeMantineTheme,
} from '@mantine/core'

export const theme = mergeMantineTheme(
  DEFAULT_THEME,
  createTheme({
    components: {
      Button: Button.extend({
        defaultProps: { variant: 'outline' },
        styles: {
          label: {
            textTransform: 'uppercase',
          },
        },
      }),
      Menu: Menu.extend({
        styles: {
          itemLabel: {
            color: 'inherit',
          },
          item: {
            color: 'inherit',
          },
        },
      }),
      ThemeIcon: ThemeIcon.extend({
        defaultProps: {
          variant: 'light',
        },
        styles: (_theme, props, _ctx) => ({
          root: { background: props.variant === 'light' ? 'none' : undefined },
        }),
      }),
    },
  })
)
