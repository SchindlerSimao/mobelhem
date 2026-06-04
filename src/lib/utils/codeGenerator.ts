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
	const array = new Uint8Array(length);
	globalThis.crypto.getRandomValues(array);
	let code = '';
	for (let i = 0; i < length; i++) {
		code += chars[array[i] % chars.length];
	}
	return code;
}
