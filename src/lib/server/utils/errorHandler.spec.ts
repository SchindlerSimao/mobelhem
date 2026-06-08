import { describe, it, expect, vi } from 'vitest';
import {
	GameError,
	ValidationError,
	RoomNotFoundError,
	GameAlreadyStartedError,
	handleError
} from './errorHandler';

describe('errorHandler', () => {
	it('GameError should construct and toJSON correctly', () => {
		const err = new GameError('Test message', 'TEST_CODE', 400);
		expect(err.message).toBe('Test message');
		expect(err.code).toBe('TEST_CODE');
		expect(err.statusCode).toBe(400);
		expect(err.toJSON()).toEqual({
			message: 'Test message',
			code: 'TEST_CODE',
			statusCode: 400
		});
	});

	it('ValidationError should construct with default status 400', () => {
		const err = new ValidationError('Bad pseudo');
		expect(err.code).toBe('VALIDATION_ERROR');
		expect(err.statusCode).toBe(400);
	});

	it('RoomNotFoundError should construct with default status 404', () => {
		const err = new RoomNotFoundError();
		expect(err.code).toBe('ROOM_NOT_FOUND');
		expect(err.statusCode).toBe(404);
	});

	it('GameAlreadyStartedError should construct with default status 400', () => {
		const err = new GameAlreadyStartedError();
		expect(err.code).toBe('GAME_ALREADY_STARTED');
		expect(err.statusCode).toBe(400);
	});

	describe('handleError', () => {
		it('should return the error and log it if it is a GameError', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const err = new ValidationError('Invalid input');

			const res = handleError(err, 'context');
			expect(res).toBe(err);
			expect(consoleSpy).toHaveBeenCalledWith('[context] VALIDATION_ERROR: Invalid input');
			consoleSpy.mockRestore();
		});

		it('should wrap other errors in an INTERNAL_ERROR GameError', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const plainError = new Error('Database connection failed');

			const res = handleError(plainError, 'db_context');
			expect(res.code).toBe('INTERNAL_ERROR');
			expect(res.statusCode).toBe(500);
			expect(res.message).toBe('An unexpected error occurred');
			expect(consoleSpy).toHaveBeenCalledWith('[db_context] Unexpected error:', plainError);
			consoleSpy.mockRestore();
		});
	});
});
