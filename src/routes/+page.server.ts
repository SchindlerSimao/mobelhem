import { db } from '$lib/server/db';
import { scores, words } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { GAME_CONSTANTS } from '$lib/config/gameConstants';
import { validators } from '$lib/utils/validators';

export const load: PageServerLoad = async () => {
	try {
		const [highScores, gameWords] = await Promise.all([
			db
				.select()
				.from(scores)
				.orderBy(desc(scores.score))
				.limit(GAME_CONSTANTS.LEADERBOARD_LIMIT),
			db.select().from(words)
		]);

		return {
			highScores: highScores.map((s) => ({
				id: s.id,
				username: s.username,
				score: s.score,
				mode: s.mode,
				createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString()
			})),
			gameWords: gameWords.map((w) => ({
				name: w.name,
				type: w.type as 'ikea' | 'city' | 'both',
				country: (w.country as 'SE' | 'NO' | 'DK' | 'FI' | null) || null,
				lat: w.lat ? parseFloat(w.lat) : undefined,
				lng: w.lng ? parseFloat(w.lng) : undefined,
				ikeaDesc: w.ikeaDesc || undefined,
				cityDesc: w.cityDesc || undefined,
				funFact: w.funFact
			}))
		};
	} catch (e) {
		console.error('Failed to load data:', e);
		return {
			highScores: [],
			gameWords: []
		};
	}
};

export const actions: Actions = {
	saveScore: async ({ request }) => {
		try {
			const data = await request.formData();
			const username = data.get('username')?.toString() || 'Anonyme';
			const score = parseInt(data.get('score')?.toString() || '0', 10);
			const mode = data.get('mode')?.toString() || 'classic';

			// Validate inputs
			const usernameVal = validators.username(username);
			if (!usernameVal.valid) {
				return { success: false, error: usernameVal.error };
			}

			if (score < 0 || score > 10000) {
				return { success: false, error: 'Invalid score' };
			}

			await db.insert(scores).values({
				username: username.trim(),
				score,
				mode
			});

			return { success: true };
		} catch (e) {
			console.error('Failed to save score:', e);
			return { success: false, error: 'Erreur lors de la sauvegarde.' };
		}
	}
};
