/**
 * Room manager with auto-cleanup to prevent memory leaks
 */
import type { Server } from 'socket.io';
import { GAME_CONSTANTS } from '../../config/gameConstants';

export interface Player {
	id: string;
	socketId: string;
	username: string;
	score: number;
	voted: boolean;
	vote: 'ikea' | 'city' | null;
	voteTime: number;
	isHost: boolean;
}

export type DbWord = {
	id: string;
	name: string;
	type: 'ikea' | 'city' | 'both';
	country: string | null;
	lat: string | null;
	lng: string | null;
	ikeaDesc: string | null;
	cityDesc: string | null;
	funFact: string;
};

export interface Room {
	code: string;
	players: Player[];
	status: 'lobby' | 'playing' | 'ended';
	currentRoundIndex: number;
	selectedWords: DbWord[];
	timeLeft: number;
	timer: NodeJS.Timeout | null;
	createdAt: Date;
	lastActivityAt: Date;
}

/**
 * Manages game rooms with automatic cleanup
 */
export class RoomManager {
	private rooms = new Map<string, Room>();
	private roomTimeouts = new Map<string, NodeJS.Timeout>();
	private cleanupInterval: NodeJS.Timeout | null = null;

	constructor(private io: Server) {
		this.startCleanupInterval();
	}

	/**
	 * Creates a new room
	 */
	createRoom(code: string): Room {
		const now = new Date();
		const room: Room = {
			code,
			players: [],
			status: 'lobby',
			currentRoundIndex: 0,
			selectedWords: [],
			timeLeft: GAME_CONSTANTS.MULTIPLAYER_ROUND_TIME_SECONDS,
			timer: null,
			createdAt: now,
			lastActivityAt: now
		};

		this.rooms.set(code, room);
		this.setRoomTimeout(code);
		return room;
	}

	/**
	 * Gets a room by code
	 */
	getRoom(code: string): Room | undefined {
		return this.rooms.get(code);
	}

	/**
	 * Deletes a room and cleans up resources
	 */
	deleteRoom(code: string): void {
		const room = this.rooms.get(code);
		if (!room) return;

		console.log(
			`[RoomManager] Deleting room ${code} (status: ${room.status}, players: ${room.players.length})`
		);

		if (room.timer) {
			clearInterval(room.timer);
			room.timer = null;
			console.log(`[RoomManager] Cleared timer for room ${code}`);
		}

		const timeout = this.roomTimeouts.get(code);
		if (timeout) {
			clearTimeout(timeout);
			this.roomTimeouts.delete(code);
		}

		this.rooms.delete(code);

		console.log(`[RoomManager] Room ${code} deleted`);
	}

	/**
	 * Sets inactivity timeout for a room
	 */
	private setRoomTimeout(code: string): void {
		// Clear existing timeout
		const existing = this.roomTimeouts.get(code);
		if (existing) clearTimeout(existing);

		// Set new timeout
		const timeout = setTimeout(() => {
			const room = this.rooms.get(code);
			if (room) {
				console.log(
					`[RoomManager] Room ${code} auto-deleted due to inactivity (created: ${room.createdAt.toISOString()})`
				);
				this.deleteRoom(code);
				this.io.to(code).emit('room_closed', { reason: 'inactivity' });
			}
		}, GAME_CONSTANTS.MULTIPLAYER_ROOM_TIMEOUT_MS);

		this.roomTimeouts.set(code, timeout);
	}

	/**
	 * Resets inactivity timer on activity
	 */
	updateActivity(code: string): void {
		const room = this.rooms.get(code);
		if (room) {
			room.lastActivityAt = new Date();
			this.setRoomTimeout(code);
		}
	}

	/**
	 * Gets all active rooms (for debugging/monitoring)
	 */
	getAllRooms(): Room[] {
		return Array.from(this.rooms.values());
	}

	/**
	 * Starts periodic cleanup for orphaned/stuck games
	 */
	private startCleanupInterval(): void {
		this.cleanupInterval = setInterval(
			() => {
				const now = new Date();
				const stuckRooms: string[] = [];

				for (const [code, room] of this.rooms.entries()) {
					// Check for stuck games (more than room timeout without updates)
					const ageMs = now.getTime() - room.createdAt.getTime();

					if (ageMs > GAME_CONSTANTS.MULTIPLAYER_ROOM_TIMEOUT_MS * 2) {
						stuckRooms.push(code);
					}
				}

				if (stuckRooms.length > 0) {
					console.log(`[RoomManager] Cleaning up ${stuckRooms.length} stuck rooms`);
					stuckRooms.forEach((code) => this.deleteRoom(code));
				}
			},
			5 * 60 * 1000
		); // Every 5 minutes
	}

	/**
	 * Stops cleanup interval (for shutdown)
	 */
	destroy(): void {
		if (this.cleanupInterval) clearInterval(this.cleanupInterval);

		// Clean up all rooms
		const codes = Array.from(this.rooms.keys());
		codes.forEach((code) => this.deleteRoom(code));
	}
}
