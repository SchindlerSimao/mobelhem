import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const scores = sqliteTable(
	'scores',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		username: text('username').notNull(),
		score: integer('score').notNull(),
		mode: text('mode').notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
	},
	(table) => [
		// Index for leaderboard queries (most important)
		index('scores_mode_score_idx').on(table.mode, table.score),
		// Index for recent scores
		index('scores_created_at_idx').on(table.createdAt),
		// Index for player history
		index('scores_username_idx').on(table.username)
	]
);
