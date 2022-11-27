import { defineConfig } from 'astro/config'
import deno from '@astrojs/deno'
import node from '@astrojs/node'
import preact from '@astrojs/preact'
//import vercel from '@astrojs/vercel/static'

const isDeno = process.argv.includes('--deno')
const isNode = !isDeno && process.argv.includes('--node')
const isVercel = !isDeno && !isNode

export default defineConfig({
	adapter: (isDeno && deno()) || (isNode && node()) || undefined /*vercel()*/,
	integrations: [preact()],
	//output: 'static',
	site: 'https://settlers2.net',
	vite: {
		optimizeDeps: {
			exclude: ['postgres'],
		},
	},
})
