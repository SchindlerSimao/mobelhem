/**
 * Game validation utilities
 */

import { GAME_CONSTANTS } from '../config/gameConstants';

export interface ValidationResult {
	valid: boolean;
	error?: string;
}

export const validators = {
	username: (name: string): ValidationResult => {
		if (!name?.trim()) return { valid: false, error: 'Username required' };
		if (name.length > 20) return { valid: false, error: 'Username too long (max 20 chars)' };
		if (!/^[a-zA-Z0-9_\-\s]{1,20}$/.test(name)) {
			return { valid: false, error: 'Username contains invalid characters' };
		}
		return { valid: true };
	},

	roomCode: (code: string): ValidationResult => {
		if (!code) return { valid: false, error: 'Room code required' };
		const codeUpper = code.toUpperCase().trim();
		if (codeUpper.length !== GAME_CONSTANTS.ROOM_CODE_LENGTH) {
			return {
				valid: false,
				error: `Room code must be exactly ${GAME_CONSTANTS.ROOM_CODE_LENGTH} characters`
			};
		}
		if (!/^[A-Z0-9]+$/.test(codeUpper)) {
			return { valid: false, error: 'Room code must contain only letters and numbers' };
		}
		return { valid: true };
	},

	vote: (vote: unknown): ValidationResult => {
		if (!vote || !['ikea', 'city', 'both'].includes(String(vote))) {
			return { valid: false, error: 'Invalid vote' };
		}
		return { valid: true };
	},

	voteTime: (time: unknown): ValidationResult => {
		if (typeof time !== 'number' || time < 0 || time > 10000) {
			return { valid: false, error: 'Invalid vote time' };
		}
		return { valid: true };
	}
};
