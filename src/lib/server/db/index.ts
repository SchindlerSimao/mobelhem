import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { seedDatabase } from './seed';

const databaseUrl = process.env.DATABASE_URL || 'local.db';

const client = new Database(databaseUrl);

export const db = drizzle(client, { schema });

export async function initializeDatabase(): Promise<void> {
	migrate(db, { migrationsFolder: './drizzle' });
	await seedDatabase();
}
