import { purgeCss } from 'vite-plugin-tailwind-purgecss';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
	plugins: [sveltekit(), purgeCss(), nodeResolve({
		preferBuiltins: true,
		browser: false,
	}),],
	build: {
		sourcemap: false,
		rollupOptions: {
			external: ['iconv-lite', 'jschardet']
		}
	},
	ssr: {
		noExternal: ['iconv-lite'],
	},
	server: {
		fs: {
			allow: ['.']
		},
		host: true, // 全てのIPアドレスでリッスンする
		port: 3041, // ポートを指定（必要に応じて変更可能）
	},
});