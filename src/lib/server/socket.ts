import type { Server, Socket } from 'socket.io';
import { db } from './db';
import { words, scores } from './db/schema';
import { RoomManager } from './game/RoomManager';
import { calculateRoundScore, isAnswerCorrect } from './game/scoring';
import { generateRoomCode } from '../utils/codeGenerator';
import { selectRandomItems } from '../utils/shuffle';
import { validators } from '../utils/validators';
import {
	handleError,
	ValidationError,
	RoomNotFoundError,
	GameAlreadyStartedError
} from './utils/errorHandler';
import { GAME_CONSTANTS } from '../config/gameConstants';

let roomManager: RoomManager;

const RATE_LIMITS = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
	socketId: string,
	maxRequests: number = 5,
	windowMs: number = 60000
): boolean {
	const now = Date.now();
	const record = RATE_LIMITS.get(socketId);

	if (!record || now > record.resetAt) {
		RATE_LIMITS.set(socketId, { count: 1, resetAt: now + windowMs });
		return true;
	}

	if (record.count >= maxRequests) {
		return false;
	}

	record.count++;
	return true;
}

export function setupSockets(io: Server) {
	roomManager = new RoomManager(io);

	io.on('connection', (socket: Socket) => {
		console.log(`Socket connected: ${socket.id}`);


		socket.onAny((event, ...args) => {
			let maxRequests :number;
			let windowMs :number;
			switch (event) {
				case 'create_room':
					maxRequests = 5;
					windowMs = 60000;
					break;
				case 'join_room':
					maxRequests = 10;
					windowMs = 60000;
					break;
				case 'start_game':
					maxRequests = 3;
					windowMs = 60000;
					break;
				case 'submit_vote':
					maxRequests = 20;
					windowMs = 60000;
					break;
				default:
					maxRequests = 10;
					windowMs = 60000;
			}
			if (!checkRateLimit(socket.id, maxRequests, windowMs)) {
					socket.emit('error_message', 'Too many requests. Please wait a moment.');
					return;
			}
		});

		socket.on('create_room', () => {
			try {

				let code: string;
				let attempts = 0;
				const maxAttempts = 10;

				do {
					code = generateRoomCode();
					attempts++;
				} while (roomManager.getRoom(code) && attempts < maxAttempts);

				if (attempts >= maxAttempts) {
					throw new ValidationError('Failed to generate unique room code. Please try again.');
				}

				roomManager.createRoom(code);
				socket.emit('room_created', code);
				console.log(`[socket] Room created: ${code}`);
			} catch (error) {
				const err = handleError(error, 'create_room');
				socket.emit('error_message', err.message);
			}
		});

		socket.on('join_room', ({ code, username }: { code: string; username: string }) => {
			try {

				const usernameValidation = validators.username(username);
				if (!usernameValidation.valid) {
					throw new ValidationError(usernameValidation.error || 'Invalid username');
				}

				const room = roomManager.getRoom(code);
				if (!room) {
					throw new RoomNotFoundError();
				}

				if (room.status !== 'lobby') {
					throw new GameAlreadyStartedError();
				}

				const isHost = room.players.length === 0;
				const player = {
					id: socket.id,
					socketId: socket.id,
					username: username.trim(),
					score: 0,
					voted: false,
					vote: null as 'ikea' | 'city' | null,
					voteTime: 0,
					isHost
				};

				room.players.push(player);
				socket.join(code);
				roomManager.updateActivity(code);

				io.to(code).emit('room_updated', {
					players: room.players.map((p) => ({
						id: p.id,
						username: p.username,
						isHost: p.isHost,
						score: p.score
					})),
					status: room.status,
					code: room.code
				});

				console.log(`[socket] Player joined: ${sanitizedUsername} in room ${code}`);
			} catch (error) {
				const err = handleError(error, 'join_room');
				socket.emit('error_message', err.message);
			}
		});

		socket.on('start_game', async ({ code }: { code: string }) => {
			try {

				const room = roomManager.getRoom(code);
				if (!room) {
					throw new RoomNotFoundError();
				}

				const player = room.players.find((p) => p.socketId === socket.id);
				if (!player?.isHost) {
					throw new ValidationError('Only host can start the game');
				}

				const gameWords = await loadGameWords();
				if (gameWords.length === 0) {
					throw new ValidationError('No words available for the game');
				}

				room.status = 'playing';
				room.selectedWords = gameWords;
				room.currentRoundIndex = 0;
				room.players.forEach((p) => {
					p.score = 0;
					p.voted = false;
					p.vote = null;
				});

				roomManager.updateActivity(code);
				io.to(code).emit('game_started');
				startRound(io, room);

				console.log(`[socket] Game started in room ${code}`);
			} catch (error) {
				const err = handleError(error, 'start_game');
				socket.emit('error_message', err.message);
			}
		});

		socket.on(
			'submit_vote',
			({ code, vote, voteTime }: { code: string; vote: string; voteTime: number }) => {
				try {

					const voteValidation = validators.vote(vote);
					if (!voteValidation.valid) {
						throw new ValidationError(voteValidation.error || 'Invalid vote');
					}

					const room = roomManager.getRoom(code);
					if (!room || room.status !== 'playing') {
						throw new RoomNotFoundError();
					}

					const player = room.players.find((p) => p.socketId === socket.id);
					if (!player) {
						throw new RoomNotFoundError();
					}

					const maxVoteTime = GAME_CONSTANTS.MULTIPLAYER_ROUND_TIME_SECONDS * 1000;
					if (typeof voteTime !== 'number' || voteTime < 0 || voteTime > maxVoteTime + 1000) {
						throw new ValidationError(`Invalid vote time (must be 0-${maxVoteTime}ms)`);
					}

					if (player.voted) {
						throw new ValidationError('You already voted');
					}

					player.voted = true;
					player.vote = vote as 'ikea' | 'city';
					player.voteTime = voteTime;
					roomManager.updateActivity(code);

					io.to(code).emit('player_voted', player.username);

					const allVoted = room.players.every((p) => p.voted);
					if (allVoted) {
						if (room.timer) clearInterval(room.timer);
						revealRoundResults(io, room);
					}
				} catch (error) {
					const err = handleError(error, 'submit_vote');
					socket.emit('error_message', err.message);
				}
			}
		);

		socket.on('disconnect', () => {
			try {
				const rooms = roomManager.getAllRooms();

				for (const room of rooms) {
					const playerIdx = room.players.findIndex((p) => p.socketId === socket.id);
					if (playerIdx !== -1) {
						const player = room.players[playerIdx];
						room.players.splice(playerIdx, 1);

						if (room.players.length === 0) {
							roomManager.deleteRoom(room.code);
						} else {
							if (player.isHost) {
								let newHostIndex = 0;
								const nonHostPlayers = room.players.findIndex((p) => !p.isHost);
								if (nonHostPlayers !== -1) {
									newHostIndex = nonHostPlayers;
								}
								room.players[newHostIndex].isHost = true;

								roomManager.updateActivity(room.code);
								io.to(room.code).emit('room_updated', {
									players: room.players.map((p) => ({
										id: p.id,
										username: p.username,
										isHost: p.isHost,
										score: p.score
									})),
									status: room.status,
									code: room.code
								});

								if (room.status === 'playing') {
									io.to(room.code).emit('host_changed', room.players[newHostIndex].username);
								}
							}
						}
						break;
					}
				}
			} catch (error) {
				handleError(error, 'disconnect');
			}
		});
	});
}

/**
 * Loads game words from database
 */
async function loadGameWords() {
	try {
		const allWords = await db.select().from(words);
		if (allWords.length > 0) {
			return selectRandomItems(allWords, GAME_CONSTANTS.MULTIPLAYER_WORDS_PER_GAME);
		}
		console.warn('No words found in database');
		return [];
	} catch (e) {
		console.error('Failed to query words:', e);
		return [];
	}
}

/**
 * Starts a new round
 */
function startRound(io: Server, room: ReturnType<RoomManager['getRoom']>) {
	if (!room) return;

	room.players.forEach((p) => {
		p.voted = false;
		p.vote = null;
		p.voteTime = 0;
	});

	const word = room.selectedWords[room.currentRoundIndex];
	room.timeLeft = GAME_CONSTANTS.MULTIPLAYER_ROUND_TIME_SECONDS;

	io.to(room.code).emit('round_started', {
		wordName: word.name,
		roundIndex: room.currentRoundIndex,
		totalRounds: room.selectedWords.length,
		timeLeft: room.timeLeft
	});

	room.timer = setInterval(() => {
		room.timeLeft--;
		io.to(room.code).emit('timer_updated', room.timeLeft);

		if (room.timeLeft <= 0) {
			if (room.timer) clearInterval(room.timer);
			revealRoundResults(io, room);
		}
	}, 1000);
}

/**
 * Reveals round results and advances to next round or ends game
 */
function revealRoundResults(io: Server, room: ReturnType<RoomManager['getRoom']>) {
	if (!room) return;

	const word = room.selectedWords[room.currentRoundIndex];

	// Calculate scores using centralized logic
	room.players.forEach((p) => {
		if (p.voted && p.vote) {
			p.score += calculateRoundScore(p.vote, word.type as 'ikea' | 'city' | 'both', p.voteTime);
		}
	});

	io.to(room.code).emit('round_ended', {
		word,
		players: room.players
			.map((p) => ({
				id: p.id,
				username: p.username,
				score: p.score,
				lastVoteCorrect: isAnswerCorrect(p.vote, word.type as 'ikea' | 'city' | 'both'),
				lastVote: p.vote,
				lastVoteTime: p.voteTime
			}))
			.sort((a, b) => b.score - a.score)
	});

	// Advance to next round or end game
	setTimeout(() => {
		room.currentRoundIndex++;

		if (room.currentRoundIndex < room.selectedWords.length) {
			startRound(io, room);
		} else {
			endGame(io, room);
		}
	}, GAME_CONSTANTS.MULTIPLAYER_ROUND_END_DELAY_MS);
}

/**
 * Ends the game and saves scores
 */
async function endGame(io: Server, room: ReturnType<RoomManager['getRoom']>) {
	if (!room) return;

	room.status = 'ended';

	// Save all player scores
	for (const p of room.players) {
		try {
			await db.insert(scores).values({
				username: p.username,
				score: p.score,
				mode: 'multiplayer'
			});
		} catch (e) {
			console.error(`Failed to save score for ${p.username}:`, e);
		}
	}

	io.to(room.code).emit('game_ended', {
		players: room.players
			.map((p) => ({ id: p.id, username: p.username, score: p.score }))
			.sort((a, b) => b.score - a.score)
	});

	// Schedule room cleanup
	setTimeout(() => {
		roomManager.deleteRoom(room.code);
	}, 30000); // Clean up after 30 seconds
}
