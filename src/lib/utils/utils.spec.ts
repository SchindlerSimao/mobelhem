import { describe, it, expect } from 'vitest';
import { shuffle, selectRandomItems } from '../utils/shuffle';
import { validators } from '../utils/validators';

describe('Shuffle utility', () => {
	it('returns array with same length', () => {
		const input = [1, 2, 3, 4, 5];
		const shuffled = shuffle(input);
		expect(shuffled.length).toBe(input.length);
	});

	it('contains all original elements', () => {
		const input = [1, 2, 3, 4, 5];
		const shuffled = shuffle(input);
		expect(new Set(shuffled)).toEqual(new Set(input));
	});

	it('does not mutate original array', () => {
		const input = [1, 2, 3, 4, 5];
		const original = [...input];
		shuffle(input);
		expect(input).toEqual(original);
	});

	it('usually produces different order', () => {
		const input = [1, 2, 3, 4, 5];
		// Not guaranteed, but extremely unlikely to be in same order 10+ times
		let sameCount = 0;
		for (let i = 0; i < 10; i++) {
			if (JSON.stringify(shuffle(input)) === JSON.stringify(input)) {
				sameCount++;
			}
		}
		expect(sameCount).toBeLessThan(3); // Allow for randomness
	});
});

describe('selectRandomItems', () => {
	it('selects correct number of items', () => {
		const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const selected = selectRandomItems(input, 3);
		expect(selected.length).toBe(3);
	});

	it('only contains items from original array', () => {
		const input = ['a', 'b', 'c', 'd', 'e'];
		const selected = selectRandomItems(input, 2);
		expect(selected.every((item) => input.includes(item))).toBe(true);
	});

	it('returns correct count even when count > array length', () => {
		const input = [1, 2, 3];
		const selected = selectRandomItems(input, 5);
		// Should return only available items
		expect(selected.length).toBeLessThanOrEqual(input.length);
	});
});

describe('Validators', () => {
	describe('username validator', () => {
		it('accepts valid usernames', () => {
			expect(validators.username('John').valid).toBe(true);
			expect(validators.username('Player_123').valid).toBe(true);
			expect(validators.username('user-name').valid).toBe(true);
		});

		it('rejects empty usernames', () => {
			const result = validators.username('');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('required');
		});

		it('rejects long usernames', () => {
			const result = validators.username('a'.repeat(21));
			expect(result.valid).toBe(false);
			expect(result.error).toContain('long');
		});

		it('rejects invalid characters', () => {
			const result = validators.username('user@name');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('invalid');
		});
	});

	describe('vote validator', () => {
		it('accepts valid votes', () => {
			expect(validators.vote('ikea').valid).toBe(true);
			expect(validators.vote('city').valid).toBe(true);
			expect(validators.vote('both').valid).toBe(true);
		});

		it('rejects invalid votes', () => {
			const result = validators.vote('invalid');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('Invalid vote');
		});

		it('rejects null/undefined votes', () => {
			expect(validators.vote(null).valid).toBe(false);
			expect(validators.vote(undefined).valid).toBe(false);
		});
	});

	describe('voteTime validator', () => {
		it('accepts valid vote times', () => {
			expect(validators.voteTime(0).valid).toBe(true);
			expect(validators.voteTime(500).valid).toBe(true);
			expect(validators.voteTime(1000).valid).toBe(true);
		});

		it('rejects negative times', () => {
			expect(validators.voteTime(-1).valid).toBe(false);
		});

		it('rejects times > 10000ms', () => {
			expect(validators.voteTime(10001).valid).toBe(false);
		});

		it('rejects non-number values', () => {
			expect(validators.voteTime('500').valid).toBe(false);
			expect(validators.voteTime(null).valid).toBe(false);
		});
	});
});
