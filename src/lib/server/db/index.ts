import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { seedDatabase } from './seed';

const databaseUrl = process.env.DATABASE_URL || 'local.db';

const client = new Database(databaseUrl);

export const db = drizzle(client, { schema });

// Populate database from words.csv asynchronously
seedDatabase();
