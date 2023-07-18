// @ts-check
import { defineConfig } from 'astro/config'
import deno from '@astrojs/deno'
import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel/serverless'
import fs from 'node:fs'
import { deflate } from 'pako'

const isDeno = process.argv.includes('--deno')
const isNode = !isDeno && process.argv.includes('--node')
const isVercel = !isDeno && !isNode

/** @type {import('vite').Plugin} */
const uint8ArrayLoader = {
	name: 'uint8Array-loader',
	transform(_code, id) {
		const [path, query] = id.split('?')
		if (query !== 'uint8array') return null

		const data = fs.readFileSync(path)
		const hex = deflate(new Uint8Array(data), { level: 9 }).reduce(
			(chars, number) => chars + number.toString(16).padStart(2, '0'),
			''
		)

		return `import { inflate } from 'pako';
const hex = '${hex}';
const array = new Uint8Array(${hex.length / 2});
for (let i = 0, j = 0; i < ${hex.length / 2}; i++, j+=2) {
	array[i] = parseInt(hex.slice(j, j + 2), 16);
}
export default inflate(array);`
	},
}

export default defineConfig({
	adapter: (isDeno && deno()) || (isNode && node({ mode: 'standalone' })) || vercel(),
	integrations: [
		preact(),
		mdx(),
		sitemap({
			filter: (page) => !page.includes('rss.xml'),
		}),
	],
	output: 'server',
	site: 'https://settlers2.net',
	vite: {
		optimizeDeps: {
			exclude: ['postgres'],
		},
		plugins: [uint8ArrayLoader],
	},
})
