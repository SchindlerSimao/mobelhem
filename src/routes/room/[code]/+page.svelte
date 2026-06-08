<script lang="ts">
	import { untrack } from 'svelte';
	import { io, type Socket } from 'socket.io-client';
	import { goto } from '$app/navigation';
	import { GAME_CONSTANTS } from '$lib/config/gameConstants';
	import type { Player, RoundPlayerResult, RoomStatus } from '$lib/types';
	import type { GameItem } from '$lib/dataset';

	import PageShell from '$lib/components/layout/PageShell.svelte';
	import PseudoEntry from '$lib/components/features/PseudoEntry.svelte';
	import MultiplayerLobby from '$lib/components/features/MultiplayerLobby.svelte';
	import MultiplayerGame from '$lib/components/features/MultiplayerGame.svelte';
	import MultiplayerFeedback from '$lib/components/features/MultiplayerFeedback.svelte';
	import MultiplayerEnd from '$lib/components/features/MultiplayerEnd.svelte';

	let { data } = $props();

	interface RoundWord {
		name: string;
		type?: 'ikea' | 'city' | 'both';
		country?: 'SE' | 'NO' | 'DK' | 'FI' | null;
		lat?: string | number | null;
		lng?: string | number | null;
		cityDesc?: string | null;
	}

	let socket = $state<Socket | null>(null);
	let currentUsername = $state('');
	let roomCode = $state('');
	$effect(() => {
		currentUsername = data.username;
		roomCode = data.code;
	});

	let lobbyPlayers = $state<Player[]>([]);
	let gameStatus = $state<RoomStatus>('lobby');
	let showFeedback = $state(false);
	let activeWord = $state<RoundWord | null>(null);
	let roundIndex = $state(0);
	let totalRounds = $state(0);
	let timeLeft = $state<number>(GAME_CONSTANTS.MULTIPLAYER_ROUND_TIME_SECONDS);
	let voted = $state(false);
	let votedPlayers = $state<string[]>([]);
	let roundStartTimestamp = $state(0);
	let roundResults = $state<RoundPlayerResult[]>([]);
	let finalLeaderboard = $state<Player[]>([]);
	let errorMessage = $state<string | null>(null);

	let isHost = $derived(lobbyPlayers.find((p) => p.id === socket?.id)?.isHost ?? false);

	$effect(() => {
		const hasSocket = untrack(() => socket);
		if (!currentUsername || hasSocket) return;

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

		s.on('room_updated', (d: { players: Player[]; status: RoomStatus; code: string }) => {
			lobbyPlayers = d.players;
			gameStatus = d.status;
			untrack(() => {
				roomCode = d.code;
			});
		});

		s.on('game_started', () => {
			gameStatus = 'playing';
			showFeedback = false;
		});

		s.on(
			'round_started',
			(d: { wordName: string; roundIndex: number; totalRounds: number; timeLeft: number }) => {
				showFeedback = false;
				activeWord = { name: d.wordName };
				roundIndex = d.roundIndex;
				totalRounds = d.totalRounds;
				timeLeft = d.timeLeft;
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

		s.on('round_ended', (d: { word: RoundWord; players: RoundPlayerResult[] }) => {
			showFeedback = true;
			activeWord = d.word;
			roundResults = d.players;
		});

		s.on('game_ended', (d: { players: Player[] }) => {
			gameStatus = 'ended';
			finalLeaderboard = d.players;
		});

		s.on('error_message', (msg: string) => {
			errorMessage = msg;
			setTimeout(() => goto('/'), 3000);
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

<svelte:head>
	<title>Salon {roomCode || 'Multijoueur'} - Möbelhem</title>
</svelte:head>

<PageShell
	onHome={leaveRoom}
	showLeave={socket != null && gameStatus !== 'ended'}
	leaveLabel="Quitter le salon"
>
	{#if errorMessage}
		<div
			class="mx-auto max-w-sm rounded-md border border-danger/30 bg-danger/10 p-4 text-center text-sm text-danger"
		>
			{errorMessage}
			<p class="mt-1 text-xs text-muted">Redirection...</p>
		</div>
	{:else if !currentUsername}
		<PseudoEntry {roomCode} onSubmit={joinWithPseudo} />
	{:else if gameStatus === 'lobby'}
		<MultiplayerLobby
			code={roomCode}
			players={lobbyPlayers}
			{isHost}
			onStart={triggerStart}
			onLeave={leaveRoom}
		/>
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
			<MultiplayerFeedback item={activeWord as unknown as GameItem} playersResult={roundResults} />
		{/if}
	{:else if gameStatus === 'ended'}
		<MultiplayerEnd players={finalLeaderboard} onLeave={leaveRoom} />
	{/if}
</PageShell>
