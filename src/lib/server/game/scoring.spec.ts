import { describe, it, expect } from 'vitest';
import { calculateRoundScore, isAnswerCorrect } from './scoring';
import { GAME_CONSTANTS } from '../../config/gameConstants';

describe('Game Scoring', () => {
	describe('isAnswerCorrect', () => {
		it('accepts correct ikea vote', () => {
			expect(isAnswerCorrect('ikea', 'ikea')).toBe(true);
			expect(isAnswerCorrect('ikea', 'both')).toBe(true);
		});

		it('accepts correct city vote', () => {
			expect(isAnswerCorrect('city', 'city')).toBe(true);
			expect(isAnswerCorrect('city', 'both')).toBe(true);
		});

		it('rejects incorrect votes', () => {
			expect(isAnswerCorrect('ikea', 'city')).toBe(false);
			expect(isAnswerCorrect('city', 'ikea')).toBe(false);
		});

		it('handles null votes', () => {
			expect(isAnswerCorrect(null, 'both')).toBe(false);
			expect(isAnswerCorrect(null, 'ikea')).toBe(false);
		});
	});

	describe('calculateRoundScore', () => {
		it('awards base + speed bonus for fast correct answers', () => {
			// Fast vote at 100ms on ikea item
			const score = calculateRoundScore('ikea', 'ikea', 100);
			const expectedBonus = Math.max(
				0,
				Math.floor(
					GAME_CONSTANTS.MULTIPLAYER_BASE_POINTS -
						100 / GAME_CONSTANTS.MULTIPLAYER_SPEED_BONUS_DIVISOR
				)
			);
			expect(score).toBe(GAME_CONSTANTS.MULTIPLAYER_BASE_POINTS + expectedBonus);
		});

		it('awards zero for incorrect answers', () => {
			expect(calculateRoundScore('ikea', 'city', 100)).toBe(0);
			expect(calculateRoundScore('city', 'ikea', 100)).toBe(0);
			expect(calculateRoundScore(null, 'both', 100)).toBe(0);
		});

		it('awards full score for slow but correct answers', () => {
			// Very slow vote (800ms)
			const score = calculateRoundScore('ikea', 'ikea', 800);
			// Speed bonus should be minimal or 0
			const expectedBonus = Math.max(
				0,
				Math.floor(
					GAME_CONSTANTS.MULTIPLAYER_BASE_POINTS -
						800 / GAME_CONSTANTS.MULTIPLAYER_SPEED_BONUS_DIVISOR
				)
			);
			expect(score).toBe(GAME_CONSTANTS.MULTIPLAYER_BASE_POINTS + expectedBonus);
		});

		it('correctly scores "both" type answers', () => {
			// Fast correct vote on "both" item
			const score = calculateRoundScore('ikea', 'both', 100);
			const expectedBonus = Math.max(
				0,
				Math.floor(
					GAME_CONSTANTS.MULTIPLAYER_BASE_POINTS -
						100 / GAME_CONSTANTS.MULTIPLAYER_SPEED_BONUS_DIVISOR
				)
			);
			expect(score).toBe(GAME_CONSTANTS.MULTIPLAYER_BASE_POINTS + expectedBonus);
		});
	});
});
