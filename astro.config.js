// @ts-check
import { defineConfig } from 'astro/config'
import deno from '@astrojs/deno'
import node from '@astrojs/node'
import preact from '@astrojs/preact'
import fs from 'node:fs'
//import vercel from '@astrojs/vercel/static'

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
		const array = Array.from(new Uint8Array(data))

		return `export default new Uint8Array(${JSON.stringify(array)});`
	},
}

export default defineConfig({
	adapter: (isDeno && deno()) || (isNode && node({ mode: 'standalone' })) || undefined /*vercel()*/,
	integrations: [preact()],
	//output: 'static',
	site: 'https://settlers2.net',
	vite: {
		optimizeDeps: {
			exclude: ['postgres'],
		},
		plugins: [uint8ArrayLoader],
	},
})
