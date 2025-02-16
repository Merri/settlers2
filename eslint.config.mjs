// @ts-check

import eslint from '@eslint/js'
import eslintPluginAstro from 'eslint-plugin-astro'
import tseslint from 'typescript-eslint'

export default tseslint.config([
	{ files: ['src/**/*.{js,jsx,ts,tsx}'] },
	eslint.configs.recommended,
	tseslint.configs.recommended,
	{ files: ['src/**/*.astro'] },
	eslintPluginAstro.configs.recommended,
])
