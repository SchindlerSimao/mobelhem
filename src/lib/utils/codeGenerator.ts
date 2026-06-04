/**
 * Secure room code generation using crypto
 */
import { GAME_CONSTANTS } from '../config/gameConstants';

/**
 * Generates a cryptographically secure room code
 * Uses Web Crypto API for better randomization
 */
export function generateRoomCode(length: number = GAME_CONSTANTS.ROOM_CODE_LENGTH): string {
	const chars = GAME_CONSTANTS.ROOM_CODE_CHARSET;
	let code = '';

	if (typeof window === 'undefined') {
		// Server-side: use Node.js crypto
		const array = new Uint8Array(length);
		const crypto = require('crypto');
		crypto.getRandomValues(array);
		for (let i = 0; i < length; i++) {
			code += chars[array[i] % chars.length];
		}
	} else {
		// Client-side: use Web Crypto
		const array = new Uint8Array(length);
		globalThis.crypto.getRandomValues(array);
		for (let i = 0; i < length; i++) {
			code += chars[array[i] % chars.length];
		}
	}

	return code;
}
