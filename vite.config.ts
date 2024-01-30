import { sveltekit } from '@sveltejs/kit/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import type { SvelteKitPWAOptions } from '@vite-pwa/sveltekit';
import { ViteToml } from 'vite-plugin-toml';

const pwaOptions: Partial<SvelteKitPWAOptions> = {
	manifest: {
		name: 'halDeck',
		short_name: 'halDeck',
		description: 'halDeck',
		lang: 'ja',
	},
	devOptions: {
		enabled: true,
	},
	registerType: 'autoUpdate',
}

export default defineConfig(({ command, mode }) =>
{
	const env = loadEnv(mode, process.cwd(), '');
	return {
		plugins: [
			sveltekit(),
			SvelteKitPWA(pwaOptions),
			ViteToml(),
		],
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		},
		server: {
			host: true,
			port: env.PUBLIC_HTTPS_PORT,
			strictPort: true,
			https: { // HTTPSにしないとiOSでScreen Wake Lock APIが使えない
				key: env.KEY_PATH,
				cert: env.CERT_PATH,
			}
		}
	};
});
