import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte'],
	preprocess: [vitePreprocess()],

	kit: {
		adapter: adapter({
			pages: 'public',
			assets: 'public',
			fallback: "index.html",
			precompress: false,
			strict: true
		}),
		paths: {
			base: dev ? '' : '/file-binder'
		}
	}
};

export default config;