import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RoomManager } from './RoomManager';
import type { Server } from 'socket.io';

describe('RoomManager', () => {
	let ioMock: Server;
	let roomManager: RoomManager;

	beforeEach(() => {
		vi.useFakeTimers();
		ioMock = {
			to: vi.fn().mockReturnThis(),
			emit: vi.fn()
		} as unknown as Server;
		roomManager = new RoomManager(ioMock);
	});

	afterEach(() => {
		roomManager.destroy();
		vi.useRealTimers();
	});

	it('should create a room with default properties', () => {
		const code = 'TEST1';
		const room = roomManager.createRoom(code);

		expect(room.code).toBe(code);
		expect(room.players).toEqual([]);
		expect(room.status).toBe('lobby');
		expect(room.currentRoundIndex).toBe(0);
		expect(room.timer).toBeNull();
		expect(roomManager.getRoom(code)).toBe(room);
	});

	it('should retrieve an existing room', () => {
		const code = 'TEST2';
		roomManager.createRoom(code);
		const room = roomManager.getRoom(code);
		expect(room).toBeDefined();
		expect(room?.code).toBe(code);
	});

	it('should return undefined for a non-existing room', () => {
		expect(roomManager.getRoom('NONE')).toBeUndefined();
	});

	it('should delete a room and clean up its resources', () => {
		const code = 'TEST3';
		roomManager.createRoom(code);
		expect(roomManager.getRoom(code)).toBeDefined();

		roomManager.deleteRoom(code);
		expect(roomManager.getRoom(code)).toBeUndefined();
	});

	it('should auto-delete room and notify players after inactivity timeout', () => {
		const code = 'INACTIVE';
		roomManager.createRoom(code);

		// Advance time past the timeout (usually 1 hour / 3600000 ms)
		vi.advanceTimersByTime(2 * 60 * 60 * 1000);

		expect(roomManager.getRoom(code)).toBeUndefined();
		expect(ioMock.to).toHaveBeenCalledWith(code);
		expect(ioMock.emit).toHaveBeenCalledWith('room_closed', { reason: 'inactivity' });
	});

	it('should reset inactivity timeout when updateActivity is called', () => {
		const code = 'ACTIVE';
		roomManager.createRoom(code);

		// Advance time by 15 minutes (less than the timeout of 30 minutes)
		vi.advanceTimersByTime(15 * 60 * 1000);
		expect(roomManager.getRoom(code)).toBeDefined();

		// Update activity
		roomManager.updateActivity(code);

		// Advance by another 20 minutes (total 35 minutes from start, but only 20 from update)
		vi.advanceTimersByTime(20 * 60 * 1000);
		expect(roomManager.getRoom(code)).toBeDefined();

		// Advance past the timeout from the last update (another 15 minutes, total 35 minutes since update)
		vi.advanceTimersByTime(15 * 60 * 1000);
		expect(roomManager.getRoom(code)).toBeUndefined();
	});

	it('should return all active rooms', () => {
		roomManager.createRoom('R1');
		roomManager.createRoom('R2');
		const rooms = roomManager.getAllRooms();
		expect(rooms.length).toBe(2);
		expect(rooms.map((r) => r.code)).toContain('R1');
		expect(rooms.map((r) => r.code)).toContain('R2');
	});
});
