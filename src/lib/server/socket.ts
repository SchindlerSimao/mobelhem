import type { Server, Socket } from 'socket.io';
import { db } from './db';
import { words } from './db/schema';

interface Player {
	id: string;
	socketId: string;
	username: string;
	score: number;
	voted: boolean;
	vote: 'ikea' | 'city' | null;
	voteTime: number;
	isHost: boolean;
}

type DbWord = typeof words.$inferSelect;

interface Room {
	code: string;
	players: Player[];
	status: 'lobby' | 'playing' | 'ended';
	currentRoundIndex: number;
	selectedWords: DbWord[];
	timeLeft: number;
	timer: NodeJS.Timeout | null;
}

const rooms = new Map<string, Room>();

export function setupSockets(io: Server) {
	io.on('connection', (socket: Socket) => {
		console.log(`Socket connected: ${socket.id}`);

		// Create Room
		socket.on('create_room', () => {
			const code = Math.random().toString(36).substring(2, 6).toUpperCase();
			rooms.set(code, {
				code,
				players: [],
				status: 'lobby',
				currentRoundIndex: 0,
				selectedWords: [],
				timeLeft: 8,
				timer: null
			});
			socket.emit('room_created', code);
		});

		// Join Room
		socket.on('join_room', ({ code, username }: { code: string; username: string }) => {
			const room = rooms.get(code);
			if (!room) {
				socket.emit('error_message', "Le salon n'existe pas.");
				return;
			}
			if (room.status !== 'lobby') {
				socket.emit('error_message', 'La partie a déjà commencé.');
				return;
			}

			// Add player
			const isHost = room.players.length === 0;
			const player: Player = {
				id: socket.id,
				socketId: socket.id,
				username,
				score: 0,
				voted: false,
				vote: null,
				voteTime: 0,
				isHost
			};
			room.players.push(player);
			socket.join(code);

			io.to(code).emit('room_updated', {
				players: room.players.map((p) => ({
					username: p.username,
					isHost: p.isHost,
					score: p.score
				})),
				status: room.status,
				code: room.code
			});
		});

		// Start Game
		socket.on('start_game', async ({ code }: { code: string }) => {
			const room = rooms.get(code);
			if (!room) return;

			const player = room.players.find((p) => p.socketId === socket.id);
			if (!player || !player.isHost) return;

			let gameWords: DbWord[] = [];
			try {
				const allWords = await db.select().from(words);
				if (allWords.length > 0) {
					gameWords = allWords.sort(() => 0.5 - Math.random()).slice(0, 10);
				}
			} catch (e) {
				console.error('Failed to query words:', e);
			}

			if (gameWords.length === 0) {
				const { dataset } = await import('../dataset');
				gameWords = dataset
					.sort(() => 0.5 - Math.random())
					.slice(0, 10)
					.map((item, idx) => ({
						id: `static-${idx}`,
						name: item.name,
						type: item.type,
						country: item.country,
						lat: item.lat ? String(item.lat) : null,
						lng: item.lng ? String(item.lng) : null,
						ikeaDesc: item.ikeaDesc || null,
						cityDesc: item.cityDesc || null,
						funFact: item.funFact
					}));
			}

			room.status = 'playing';
			room.selectedWords = gameWords;
			room.currentRoundIndex = 0;
			room.players.forEach((p) => {
				p.score = 0;
				p.voted = false;
				p.vote = null;
			});

			io.to(code).emit('game_started');
			startRound(io, room);
		});

		// Submit vote
		socket.on(
			'submit_vote',
			({ code, vote, voteTime }: { code: string; vote: 'ikea' | 'city'; voteTime: number }) => {
				const room = rooms.get(code);
				if (!room || room.status !== 'playing') return;

				const player = room.players.find((p) => p.socketId === socket.id);
				if (!player || player.voted) return;

				player.voted = true;
				player.vote = vote;
				player.voteTime = voteTime;

				io.to(code).emit('player_voted', player.username);

				const allVoted = room.players.every((p) => p.voted);
				if (allVoted) {
					if (room.timer) clearInterval(room.timer);
					revealRoundResults(io, room);
				}
			}
		);

		// Disconnect
		socket.on('disconnect', () => {
			rooms.forEach((room, code) => {
				const playerIdx = room.players.findIndex((p) => p.socketId === socket.id);
				if (playerIdx !== -1) {
					const player = room.players[playerIdx];
					room.players.splice(playerIdx, 1);

					if (room.players.length === 0) {
						if (room.timer) clearInterval(room.timer);
						rooms.delete(code);
					} else {
						if (player.isHost) {
							room.players[0].isHost = true;
						}
						io.to(code).emit('room_updated', {
							players: room.players.map((p) => ({
								username: p.username,
								isHost: p.isHost,
								score: p.score
							})),
							status: room.status,
							code: room.code
						});
					}
				}
			});
		});
	});
}

function startRound(io: Server, room: Room) {
	room.players.forEach((p) => {
		p.voted = false;
		p.vote = null;
		p.voteTime = 0;
	});

	const word = room.selectedWords[room.currentRoundIndex];
	room.timeLeft = 8;

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

function revealRoundResults(io: Server, room: Room) {
	const word = room.selectedWords[room.currentRoundIndex];

	room.players.forEach((p) => {
		if (p.voted && p.vote) {
			const isCorrect =
				(p.vote === 'ikea' && (word.type === 'ikea' || word.type === 'both')) ||
				(p.vote === 'city' && (word.type === 'city' || word.type === 'both'));

			if (isCorrect) {
				const speedBonus = Math.max(0, Math.floor(100 - p.voteTime / 80));
				p.score += 100 + speedBonus;
			}
		}
	});

	io.to(room.code).emit('round_ended', {
		word,
		players: room.players
			.map((p) => ({
				username: p.username,
				score: p.score,
				lastVoteCorrect:
					p.voted &&
					p.vote &&
					((p.vote === 'ikea' && (word.type === 'ikea' || word.type === 'both')) ||
						(p.vote === 'city' && (word.type === 'city' || word.type === 'both'))),
				lastVote: p.vote,
				lastVoteTime: p.voteTime
			}))
			.sort((a, b) => b.score - a.score)
	});

	setTimeout(() => {
		room.currentRoundIndex++;
		if (room.currentRoundIndex < room.selectedWords.length) {
			startRound(io, room);
		} else {
			room.status = 'ended';

			room.players.forEach(async (p) => {
				try {
					const { scores } = await import('./db/schema');
					await db.insert(scores).values({
						username: p.username,
						score: p.score,
						mode: 'multiplayer'
					});
				} catch (e) {
					console.error('Failed to save multiplayer score:', e);
				}
			});

			io.to(room.code).emit('game_ended', {
				players: room.players
					.map((p) => ({ username: p.username, score: p.score }))
					.sort((a, b) => b.score - a.score)
			});
		}
	}, 7000);
}
