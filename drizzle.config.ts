import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL || 'local.db';
if (databaseUrl === 'local.db') {
	console.warn('No DATABASE_URL environment variable found. Using local.db as the database URL.');
}

export default defineConfig({
	schema: './src/lib/server/db/schema/index.ts',
	dialect: 'sqlite',
	dbCredentials: { url: databaseUrl },
	verbose: true,
	strict: true
});
