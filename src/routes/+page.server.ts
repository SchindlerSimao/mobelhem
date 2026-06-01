import { db } from '$lib/server/db';
import { scores } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const highScores = await db.select().from(scores).orderBy(desc(scores.score)).limit(10);
		return {
			highScores: highScores.map((s) => ({
				id: s.id,
				username: s.username,
				score: s.score,
				mode: s.mode,
				createdAt: s.createdAt ? s.createdAt.toISOString() : new Date().toISOString()
			}))
		};
	} catch (e) {
		console.error('Failed to load high scores:', e);
		return {
			highScores: []
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

			await db.insert(scores).values({
				username,
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
