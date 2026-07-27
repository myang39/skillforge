import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'agent-platform/.venv'] },
  { files: ['server/**/*.js'], languageOptions: { globals: { AbortController: 'readonly', URL: 'readonly', clearTimeout: 'readonly', console: 'readonly', fetch: 'readonly', process: 'readonly', setTimeout: 'readonly' } } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
)
