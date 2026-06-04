import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const words = sqliteTable('words', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	type: text('type').notNull(), // 'ikea' | 'city' | 'both'
	country: text('country'), // 'SE' | 'NO' | 'DK' | 'FI'
	lat: text('lat'), // stored as string
	lng: text('lng'),
	ikeaDesc: text('ikea_desc'),
	cityDesc: text('city_desc'),
	funFact: text('fun_fact').notNull()
});
