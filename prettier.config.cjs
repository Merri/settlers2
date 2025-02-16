// @ts-check

/** @type {import("prettier").Config} */
module.exports = {
	printWidth: 120,
	tabWidth: 4,
	useTabs: true,
	semi: false,
	singleQuote: true,
	trailingComma: 'es5',
	bracketSpacing: true,
	jsxBracketSameLine: false,
	fluid: false,
	plugins: ['@ianvs/prettier-plugin-sort-imports'],
	importOrder: ['<BUILTIN_MODULES>', '', '<THIRD_PARTY_MODULES>', '', '^[$]', '', '^[$]layout', '', '^[.]'],
	importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
	importOrderTypeScriptVersion: '5.0.0',
	importOrderCaseSensitive: false,
}
