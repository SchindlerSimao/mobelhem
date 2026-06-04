<script lang="ts">
	import { untrack } from 'svelte';
	import { io, type Socket } from 'socket.io-client';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { GAME_CONSTANTS } from '$lib/config/gameConstants';

	import PseudoEntry from '$lib/components/features/PseudoEntry.svelte';
	import MultiplayerLobby from '$lib/components/features/MultiplayerLobby.svelte';
	import MultiplayerGame from '$lib/components/features/MultiplayerGame.svelte';
	import MultiplayerFeedback from '$lib/components/features/MultiplayerFeedback.svelte';
	import MultiplayerEnd from '$lib/components/features/MultiplayerEnd.svelte';

	// Props from +page.ts
	let { data } = $props();

	// Room status types
	type RoomStatus = 'lobby' | 'playing' | 'ended';

	// Game States
	let socket = $state<Socket | null>(null);
	let currentUsername = $state('');
	let roomCode = $state('');
	$effect(() => {
		currentUsername = data.username;
		roomCode = data.code;
	});
	interface Player {
		id: string;
		username: string;
		isHost: boolean;
		score: number;
	}

	interface RoundWord {
		name: string;
		type?: 'ikea' | 'city' | 'both';
		country?: 'SE' | 'NO' | 'DK' | 'FI' | null;
		lat?: string | number | null;
		lng?: string | number | null;
		ikeaDesc?: string | null;
		cityDesc?: string | null;
		funFact?: string;
	}

	interface RoundPlayerResult {
		id: string;
		username: string;
		score: number;
		lastVoteCorrect: boolean;
		lastVote: 'ikea' | 'city' | null;
		lastVoteTime: number;
	}

	let lobbyPlayers = $state<Player[]>([]);
	let gameStatus = $state<RoomStatus>('lobby');

	// Active round states
	let showFeedback = $state(false);
	let activeWord = $state<RoundWord | null>(null);
	let roundIndex = $state(0);
	let totalRounds = $state(0);
	let timeLeft = $state(GAME_CONSTANTS.MULTIPLAYER_ROUND_TIME_SECONDS);
	let voted = $state(false);
	let votedPlayers = $state<string[]>([]);
	let roundStartTimestamp = $state(0);

	// Results states
	let roundResults = $state<RoundPlayerResult[]>([]);
	let finalLeaderboard = $state<Player[]>([]);
	let errorMessage = $state<string | null>(null);

	// Check if this player is the host
	let isHost = $derived(lobbyPlayers.find((p) => p.id === socket?.id)?.isHost ?? false);

	// Connect socket when pseudo is filled
	$effect(() => {
		const hasSocket = untrack(() => socket);
		if (!currentUsername || hasSocket) return;

		// Connect to the socket server (same host and port)
		const s = io();
		socket = s;

		s.on('connect', () => {
			const activeCode = untrack(() => roomCode);
			const activeUsername = untrack(() => currentUsername);
			if (activeCode === 'NEW') {
				s.emit('create_room');
			} else {
				s.emit('join_room', { code: activeCode, username: activeUsername });
			}
		});

		s.on('room_created', (newCode: string) => {
			untrack(() => {
				roomCode = newCode;
			});
			const activeUsername = untrack(() => currentUsername);
			goto(`/room/${newCode}?username=${encodeURIComponent(activeUsername)}`, {
				replaceState: true
			});
			s.emit('join_room', { code: newCode, username: activeUsername });
		});

		s.on('room_updated', (data: { players: Player[]; status: RoomStatus; code: string }) => {
			lobbyPlayers = data.players;
			gameStatus = data.status;
			untrack(() => {
				roomCode = data.code;
			});
		});

		s.on('game_started', () => {
			gameStatus = 'playing';
			showFeedback = false;
		});

		s.on(
			'round_started',
			(data: { wordName: string; roundIndex: number; totalRounds: number; timeLeft: number }) => {
				showFeedback = false;
				activeWord = { name: data.wordName };
				roundIndex = data.roundIndex;
				totalRounds = data.totalRounds;
				timeLeft = data.timeLeft;
				voted = false;
				votedPlayers = [];
				roundStartTimestamp = Date.now();
			}
		);

		s.on('timer_updated', (time: number) => {
			timeLeft = time;
		});

		s.on('player_voted', (player: string) => {
			votedPlayers = [...votedPlayers, player];
		});

		s.on('round_ended', (data: { word: RoundWord; players: RoundPlayerResult[] }) => {
			showFeedback = true;
			activeWord = data.word;
			roundResults = data.players;
		});

		s.on('game_ended', (data: { players: Player[] }) => {
			gameStatus = 'ended';
			finalLeaderboard = data.players;
		});

		s.on('error_message', (msg: string) => {
			errorMessage = msg;
			setTimeout(() => {
				goto('/');
			}, 3000);
		});

		return () => {
			s.disconnect();
			socket = null;
		};
	});

	function joinWithPseudo(pseudo: string) {
		currentUsername = pseudo;
	}

	function handleVote(vote: 'ikea' | 'city') {
		if (voted || !socket) return;
		voted = true;
		const voteTime = Date.now() - roundStartTimestamp;
		socket.emit('submit_vote', { code: roomCode, vote, voteTime });
	}

	function triggerStart() {
		if (!socket) return;
		socket.emit('start_game', { code: roomCode });
	}

	function leaveRoom() {
		socket?.disconnect();
		goto('/');
	}
</script>

<div class="mx-auto flex min-h-[90vh] max-w-6xl flex-col justify-between px-4 py-8">
	<!-- Header / Navbar -->
	<header class="mb-6 flex items-center justify-between border-b border-slate-800/80 pb-6">
		<button
			onclick={leaveRoom}
			class="group flex cursor-pointer items-center gap-3 border-none bg-transparent focus:outline-none"
		>
			<span class="text-3xl">🇸🇨</span>
			<h1
				class="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text font-display text-2xl font-bold tracking-wider text-transparent transition-opacity group-hover:opacity-80"
			>
				MÖBELHEM
			</h1>
		</button>

		{#if socket && gameStatus !== 'ended'}
			<button
				onclick={leaveRoom}
				class="cursor-pointer rounded-xl border border-red-800/40 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-300 shadow-md transition-all hover:bg-red-900/60"
			>
				Quitter le salon
			</button>
		{/if}
	</header>

	<main class="flex flex-grow flex-col justify-center">
		<!-- Error banner -->
		{#if errorMessage}
			<div
				in:fade
				class="mx-auto max-w-md rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm font-semibold text-red-400"
			>
				⚠️ {errorMessage}<br /><span class="text-xs font-normal text-slate-500"
					>Redirection vers l'accueil...</span
				>
			</div>
			<!-- Input Username screen (if missing) -->
		{:else if !currentUsername}
			<PseudoEntry {roomCode} onSubmit={joinWithPseudo} />
			<!-- Lobby view -->
		{:else if gameStatus === 'lobby'}
			<MultiplayerLobby
				code={roomCode}
				players={lobbyPlayers}
				isHost={isHost}
				onStart={triggerStart}
				onLeave={leaveRoom}
			/>
			<!-- In-game view -->
		{:else if gameStatus === 'playing' && activeWord}
			{#if !showFeedback}
				<MultiplayerGame
					wordName={activeWord.name}
					{roundIndex}
					{totalRounds}
					{timeLeft}
					{voted}
					{votedPlayers}
					playersCount={lobbyPlayers.length}
					onVote={handleVote}
				/>
			{:else}
				<MultiplayerFeedback
					item={activeWord as unknown as import('$lib/dataset').GameItem}
					playersResult={roundResults}
				/>
			{/if}
			<!-- Game over ranking view -->
		{:else if gameStatus === 'ended'}
			<MultiplayerEnd players={finalLeaderboard} onLeave={leaveRoom} />
		{/if}
	</main>

	<!-- Footer -->
	<footer class="text-slate-650 mt-6 border-t border-slate-900 pt-6 text-center text-xs">
		<p>© 2026 Möbelhem - Salon multijoueur en temps réel.</p>
	</footer>
</div>
