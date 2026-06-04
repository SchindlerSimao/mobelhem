/**
 * Game scoring logic - centralized calculation to avoid duplication
 */
import { GAME_CONSTANTS } from '../../config/gameConstants';

type ItemType = 'ikea' | 'city' | 'both';
type Vote = 'ikea' | 'city' | null;

/**
 * Checks if a vote is correct for the given item type
 */
export function isAnswerCorrect(vote: Vote, itemType: ItemType): boolean {
	if (!vote) return false;
	if (vote === 'ikea') return itemType === 'ikea' || itemType === 'both';
	if (vote === 'city') return itemType === 'city' || itemType === 'both';
	return false;
}

/**
 * Calculates score for a single round in multiplayer
 */
export function calculateRoundScore(vote: Vote, itemType: ItemType, voteTime: number): number {
	if (!isAnswerCorrect(vote, itemType)) {
		return 0;
	}

	const speedBonus = Math.max(
		0,
		Math.floor(
			GAME_CONSTANTS.MULTIPLAYER_BASE_POINTS -
				voteTime / GAME_CONSTANTS.MULTIPLAYER_SPEED_BONUS_DIVISOR
		)
	);
	return GAME_CONSTANTS.MULTIPLAYER_BASE_POINTS + speedBonus;
}
