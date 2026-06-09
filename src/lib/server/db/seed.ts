import { db } from './index';
import { words } from './schema';
import fs from 'fs';
import path from 'path';

export async function seedDatabase() {
	try {
		const existingWords = await db.select().from(words).limit(1);
		if (existingWords.length > 0) {
			console.log('Database already contains words. Seeding skipped.');
			return;
		}

		console.log('Database words table is empty. Seeding from words.csv...');

		const csvPath = path.resolve('words.csv');
		if (!fs.existsSync(csvPath)) {
			console.warn(`words.csv not found at ${csvPath}. Cannot seed words.`);
			return;
		}

		const csvContent = fs.readFileSync(csvPath, 'utf-8');
		const lines = csvContent.split(/\r?\n/);
		const wordLines = lines.filter((line) => line.trim().length > 0);

		const header = wordLines.shift();
		if (!header) return;

		const parseCSVLine = (line: string): string[] => {
			const result: string[] = [];
			let current = '';
			let inQuotes = false;

			for (let i = 0; i < line.length; i++) {
				const char = line[i];
				if (char === '"') {
					inQuotes = !inQuotes;
				} else if (char === ';' && !inQuotes) {
					result.push(current);
					current = '';
				} else {
					current += char;
				}
			}
			result.push(current);
			return result;
		};

		const valuesToInsert = wordLines
			.map((line) => {
				const parts = parseCSVLine(line);
				const [name, type, country, lat, lng, cityDesc] = parts;

				return {
					name: name?.trim() || '',
					type: (type?.trim() || 'ikea') as 'ikea' | 'city' | 'both',
					country: country?.trim() || null,
					lat: lat?.trim() || null,
					lng: lng?.trim() || null,
					cityDesc: cityDesc?.trim() || null
				};
			})
			.filter((item) => item.name.length > 0);

		if (valuesToInsert.length > 0) {
			for (let i = 0; i < valuesToInsert.length; i += 50) {
				const batch = valuesToInsert.slice(i, i + 50);
				await db.insert(words).values(batch);
			}
			console.log(`Successfully seeded ${valuesToInsert.length} words into the database.`);
		}
	} catch (e) {
		console.error('Error seeding database:', e);
	}
}
