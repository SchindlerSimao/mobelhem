import { sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

export const words = sqliteTable(
	'words',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: text('name')
			.notNull()
			.unique(),
		type: text('type').notNull(),
		country: text('country'),
		lat: text('lat'),
		lng: text('lng'),
		ikeaDesc: text('ikea_desc'),
		cityDesc: text('city_desc'),
		funFact: text('fun_fact').notNull()
	},
	(table) => [
		// Index for type filtering (used in game selection)
		index('words_type_idx').on(table.type),
		// Index for country filtering
		index('words_country_idx').on(table.country),
		// Index for name search
		index('words_name_idx').on(table.name)
	]
);
