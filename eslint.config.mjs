import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import eslintConfigPrettier from 'eslint-config-prettier'

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  eslintConfigPrettier,
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      // flags the standard SSR/CSR hydration-guard pattern (setIsClient(true) in an
      // empty-dep effect) used throughout this app; not a real bug here.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['next.config.js', 'tailwind.config.js', '.lintstagedrc.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: ['src/components/ui/*'],
  },
]

export default eslintConfig
