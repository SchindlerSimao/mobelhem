import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { Server } from 'socket.io';
import { setupSockets } from './src/lib/server/socket';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		{
			name: 'webSocketServer',
			configureServer(server) {
				if (!server.httpServer) return;
				const io = new Server(server.httpServer);
				setupSockets(io);
			}
		}
	],
	test: {
		expect: { requireAssertions: true },
		coverage: {
			provider: 'v8',
			all: true,
			include: [
				'src/lib/components/ui/**/*',
				'src/lib/server/game/**/*',
				'src/lib/server/utils/**/*',
				'src/lib/utils/**/*'
			],
			exclude: ['src/lib/types.ts', 'src/lib/app.d.ts', '**/*.d.ts', '**/*.spec.ts']
		},
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', 'src/**/*.client.{test,spec}.{js,ts}']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'jsdom',
					include: ['src/**/*.svelte.{test,spec}.{js,ts}', 'src/**/*.client.{test,spec}.{js,ts}']
				},
				resolve: {
					conditions: ['browser', 'development']
				}
			}
		]
	}
});
