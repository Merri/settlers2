import { defineConfig, ConfigEnv } from 'vite'

const defaultConfig: ReturnType<typeof defineConfig> = {
	build: { target: 'es2022' },
	optimizeDeps: { esbuildOptions: { target: 'es2022' } },
}

export default defineConfig(({ mode }: ConfigEnv) => {
	if (!process.argv.includes('--local-development')) {
		return {
			...defaultConfig,
			server: {
				hmr: {
					port: 443,
				},
			},
		}
	}
	return defaultConfig
})
