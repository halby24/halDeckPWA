import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import type { SvelteKitPWAOptions } from '@vite-pwa/sveltekit';

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

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA(pwaOptions),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		host: true,
		port: 24000,
		strictPort: true,
		https: { // HTTPSにしないとiOSでScreen Wake Lock APIが使えない
			key: './certs/halby-desktop.local-key.pem',
			cert: './certs/halby-desktop.local.pem',
		}
	}
});
