import { describe, it, expect } from 'vitest';
import { generateRoomCode } from './codeGenerator';
import { GAME_CONSTANTS } from '../config/gameConstants';

describe('codeGenerator', () => {
	it('should generate a room code of default length', () => {
		const code = generateRoomCode();
		expect(code.length).toBe(GAME_CONSTANTS.ROOM_CODE_LENGTH);
	});

	it('should generate a room code of custom length', () => {
		const code = generateRoomCode(8);
		expect(code.length).toBe(8);
	});

	it('should only contain characters from the defined charset', () => {
		const code = generateRoomCode(100);
		const charset = GAME_CONSTANTS.ROOM_CODE_CHARSET;
		for (const char of code) {
			expect(charset).toContain(char);
		}
	});

	it('should generate distinct codes on consecutive calls', () => {
		const code1 = generateRoomCode();
		const code2 = generateRoomCode();
		expect(code1).not.toBe(code2);
	});
});
