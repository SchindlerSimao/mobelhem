import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npx tsx server.ts',
		port: 3000,
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: 'http://localhost:3000/'
	},
	testMatch: '**/*.e2e.{ts,js}'
});
