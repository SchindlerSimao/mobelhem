/**
 * Game scoring logic - centralized calculation to avoid duplication
 */
import { GAME_CONSTANTS } from '../../config/gameConstants';

type ItemType = 'ikea' | 'city' | 'both';
type Vote = 'ikea' | 'city' | 'both' | null;

/**
 * Checks if a vote is correct for the given item type
 */
export function isAnswerCorrect(vote: Vote, itemType: ItemType): boolean {
	if (!vote) return false;
	if (vote === 'both') return itemType === 'both';
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

	const isBothBonus = vote === 'both' && itemType === 'both';
	const base = isBothBonus
		? GAME_CONSTANTS.MULTIPLAYER_BASE_POINTS + GAME_CONSTANTS.MULTIPLAYER_BOTH_BONUS
		: GAME_CONSTANTS.MULTIPLAYER_BASE_POINTS;
	const speedBonus = Math.max(
		0,
		Math.floor(base - voteTime / GAME_CONSTANTS.MULTIPLAYER_SPEED_BONUS_DIVISOR)
	);
	return base + speedBonus;
}
