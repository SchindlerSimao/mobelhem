/**
 * Utility functions for shuffling and random selection
 * Uses Fisher-Yates algorithm for unbiased randomization
 */

/**
 * Shuffles an array using Fisher-Yates algorithm
 * This is cryptographically unbiased unlike sort-based shuffling
 */
export function shuffle<T>(array: T[]): T[] {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
}

/**
 * Selects random items from array without replacement
 */
export function selectRandomItems<T>(array: T[], count: number): T[] {
	const shuffled = shuffle(array);
	return shuffled.slice(0, count);
}
