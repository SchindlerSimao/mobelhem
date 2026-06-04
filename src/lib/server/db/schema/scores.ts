import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const scores = sqliteTable('scores', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	username: text('username').notNull(),
	score: integer('score').notNull(),
	mode: text('mode').notNull(), // 'classic', 'time_attack'
	createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});
