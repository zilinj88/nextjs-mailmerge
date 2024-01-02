'use client'

import {
  Button,
  DEFAULT_THEME,
  type DefaultMantineColor,
  type MantineColorsTuple,
  Menu,
  ThemeIcon,
  createTheme,
  mergeMantineTheme,
} from '@mantine/core'

type ExtendedCustomColors = 'primary' | 'danger' | DefaultMantineColor

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, MantineColorsTuple>
  }
}

export const theme = mergeMantineTheme(
  DEFAULT_THEME,
  createTheme({
    colors: {
      primary: DEFAULT_THEME.colors.blue,
      danger: DEFAULT_THEME.colors.red,
    },
    components: {
      Button: Button.extend({
        defaultProps: { color: 'primary', variant: 'outline' },
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
