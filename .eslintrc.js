
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:jest/recommended',
    'prettier',
    'plugin:security/recommended',
  ],
  plugins: [
    'jest',
    'prefer-arrow',
    'filename-rules',
    'deprecation',
    '@typescript-eslint',
  ],
  overrides: [
    {
      files: ['script/**'],
      rules: {
        'no-console': 'off',
        /** Not useful on script dir as we do not handle user data. */
        'security/detect-non-literal-fs-filename': 'off',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': [
      'error',
      {
        allowArgumentsExplicitlyTypedAsAny: true,
      },
    ],
    '@typescript-eslint/consistent-type-imports': 'error',
    'deprecation/deprecation': 'error',
    'arrow-body-style': 'off',
    '@typescript-eslint/no-unnecessary-condition': 'error',
    'no-console': 'error',
    // Allow _ for no-unused-variables https://stackoverflow.com/a/64067915/8930600
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_+',
        varsIgnorePattern: '^_+',
        caughtErrorsIgnorePattern: '^_+',
      },
    ],
    // https://stackoverflow.com/a/64258560/8930600
    'prefer-arrow/prefer-arrow-functions': [
      'error',
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      },
    ],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    'func-style': ['error', 'expression', { allowArrowFunctions: true }],

    // https://stackoverflow.com/a/67652059/8930600
    'consistent-return': 'off',

    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'error',

    'require-await': 'off',
    '@typescript-eslint/require-await': 'error',

    '@typescript-eslint/no-non-null-assertion': 'error',

    '@typescript-eslint/no-explicit-any': 'error',

    /** https://github.com/eslint-community/eslint-plugin-security/issues/21#issuecomment-1157887653 */
    'security/detect-object-injection': 'off',

    '@typescript-eslint/switch-exhaustiveness-check': 'error',

    '@typescript-eslint/await-thenable': 'error',

    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

    'max-lines': ['error', 300],

    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'typeLike',
        format: ['PascalCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        /** We must support PascalCase because both zod schemas and unstated-next objects do use it */
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        leadingUnderscore: 'allow',
      },
    ],

    'import/extensions': 'off',
    'import/no-relative-parent-imports': ['error', {
      ignore: ['~/']
    }],
    'filename-rules/match': ['error', /^([a-z0-9]+-)*[a-z0-9]+(?:\..*)?$/],
    'jest/no-disabled-tests': 'error',
    'security/detect-possible-timing-attacks': 'error',
  },
}
