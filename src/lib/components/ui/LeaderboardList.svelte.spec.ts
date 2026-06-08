import { describe, it, expect } from 'vitest';
import { mount } from 'svelte';
import LeaderboardList from './LeaderboardList.svelte';
import type { ScoreEntry } from '$lib/types';

describe('LeaderboardList Component', () => {
	it('should render empty message when scores array is empty', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(LeaderboardList, {
			target,
			props: {
				scores: []
			}
		});

		expect(target.innerHTML).toContain('Aucun score enregistre.');
		target.remove();
	});

	it('should render score entries', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		const scores: ScoreEntry[] = [
			{
				id: '1',
				username: 'PlayerOne',
				score: 500,
				mode: 'normal',
				createdAt: new Date().toISOString()
			},
			{
				id: '2',
				username: 'PlayerTwo',
				score: 350,
				mode: 'normal',
				createdAt: new Date().toISOString()
			}
		];

		mount(LeaderboardList, {
			target,
			props: {
				scores
			}
		});

		expect(target.innerHTML).toContain('PlayerOne');
		expect(target.innerHTML).toContain('500');
		expect(target.innerHTML).toContain('PlayerTwo');
		expect(target.innerHTML).toContain('350');
		target.remove();
	});
});
