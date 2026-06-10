export interface GameItem {
	name: string;
	type: 'ikea' | 'city' | 'both';
	country: 'SE' | 'NO' | 'DK' | 'FI' | null;
	lat?: number;
	lng?: number;
	cityDesc?: string;
}

export interface ScoreEntry {
	id: string;
	username: string;
	score: number;
	mode: string;
	createdAt: string;
}

export interface Player {
	id: string;
	username: string;
	isHost: boolean;
	score: number;
}

export interface RoundPlayerResult {
	id: string;
	username: string;
	score: number;
	lastVoteCorrect: boolean;
	lastVote: 'ikea' | 'city' | 'both' | null;
	lastVoteTime: number;
}

export type GameStatus = 'welcome' | 'playing' | 'gameover';
export type RoomStatus = 'lobby' | 'playing' | 'ended';

export const COUNTRY_NAMES: Record<string, string> = {
	SE: 'Suède',
	NO: 'Norvège',
	DK: 'Danemark',
	FI: 'Finlande'
};
