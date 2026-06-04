/**
 * Custom error class and error handling utilities
 */

export class GameError extends Error {
	constructor(
		message: string,
		public code: string,
		public statusCode: number = 500
	) {
		super(message);
		this.name = 'GameError';
	}

	toJSON() {
		return {
			message: this.message,
			code: this.code,
			statusCode: this.statusCode
		};
	}
}

export class ValidationError extends GameError {
	constructor(message: string) {
		super(message, 'VALIDATION_ERROR', 400);
		this.name = 'ValidationError';
	}
}

export class RoomNotFoundError extends GameError {
	constructor() {
		super('Room not found', 'ROOM_NOT_FOUND', 404);
		this.name = 'RoomNotFoundError';
	}
}

export class GameAlreadyStartedError extends GameError {
	constructor() {
		super('Game has already started', 'GAME_ALREADY_STARTED', 400);
		this.name = 'GameAlreadyStartedError';
	}
}

export function handleError(error: unknown, context: string): GameError {
	if (error instanceof GameError) {
		console.error(`[${context}] ${error.code}: ${error.message}`);
		return error;
	}

	const gameError = new GameError(
		'An unexpected error occurred',
		'INTERNAL_ERROR',
		500
	);

	console.error(`[${context}] Unexpected error:`, error);
	return gameError;
}
