import { describe, it, expect } from 'vitest';
import { mount } from 'svelte';
import PlayerList from './PlayerList.svelte';

describe('PlayerList Component', () => {
	const playersMock = [
		{
			id: '1',
			socketId: 's1',
			username: 'Alice',
			score: 120,
			voted: true,
			vote: 'ikea' as const,
			voteTime: 200,
			isHost: true
		},
		{
			id: '2',
			socketId: 's2',
			username: 'Bob',
			score: 90,
			voted: false,
			vote: null,
			voteTime: 0,
			isHost: false
		}
	];

	it('should render player list and host badge', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(PlayerList, {
			target,
			props: {
				players: playersMock,
				showScore: false
			}
		});

		expect(target.innerHTML).toContain('Alice');
		expect(target.innerHTML).toContain('hote');
		expect(target.innerHTML).toContain('Bob');
		expect(target.innerHTML).toContain('pret'); // default status text
		target.remove();
	});

	it('should render scores if showScore is true', () => {
		const target = document.createElement('div');
		document.body.appendChild(target);

		mount(PlayerList, {
			target,
			props: {
				players: playersMock,
				showScore: true
			}
		});

		expect(target.innerHTML).toContain('120');
		expect(target.innerHTML).toContain('90');
		expect(target.innerHTML).not.toContain('pret');
		target.remove();
	});
});
