<script lang="ts">
	import { goto } from '$app/navigation';
	import { GAME_CONSTANTS } from '$lib/config/gameConstants';
	import type { ScoreEntry } from '$lib/types';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import TabGroup from '$lib/components/ui/TabGroup.svelte';
	import LeaderboardList from '$lib/components/ui/LeaderboardList.svelte';

	let {
		highScores = [],
		onStartGame
	}: {
		highScores: ScoreEntry[];
		onStartGame: () => void;
	} = $props();

	let activeTab = $state<'solo' | 'multi'>('solo');
	let username = $state('');
	let roomCode = $state('');

	const tabs = [
		{ id: 'solo', label: 'Solo' },
		{ id: 'multi', label: 'Multijoueur' }
	];

	function handleCreateRoom(e: Event) {
		e.preventDefault();
		if (!username.trim()) return;
		goto(`/room/NEW?username=${encodeURIComponent(username.trim())}`);
	}

	function handleJoinRoom(e: Event) {
		e.preventDefault();
		if (!username.trim() || !roomCode.trim()) return;
		goto(`/room/${roomCode.trim().toUpperCase()}?username=${encodeURIComponent(username.trim())}`);
	}
</script>

<div class="grid gap-8 lg:grid-cols-2">
	<div class="space-y-6">
		<div class="space-y-2">
			<h2 class="text-2xl font-bold tracking-tight">Ville nordique ou meuble IKEA ?</h2>
			<p class="text-sm leading-relaxed text-muted">
				Devinez si un mot scandinave est une ville ou un produit du catalogue IKEA.
			</p>
		</div>

		<TabGroup {tabs} active={activeTab} onChange={(id) => (activeTab = id as 'solo' | 'multi')} />

		{#if activeTab === 'solo'}
			<Card>
				<div class="space-y-3">
					<p class="text-xs tracking-widest text-subtle uppercase">contre la montre</p>
					<p class="text-xs text-muted">60 secondes. +2s par bonne reponse, -5s par erreur.</p>
					<Button variant="primary" onclick={onStartGame}>Commencer</Button>
				</div>
			</Card>
		{:else}
			<Card class="space-y-4">
				<div class="space-y-2">
					<label for="multi-pseudo" class="block text-xs tracking-widest text-subtle uppercase">
						pseudonyme
					</label>
					<Input id="multi-pseudo" bind:value={username} placeholder="pseudo..." maxlength={12} />
				</div>

				<div class="grid gap-3 sm:grid-cols-2">
					<form onsubmit={handleCreateRoom} class="space-y-3">
						<p class="text-xs text-muted">Creer une partie et inviter par code.</p>
						<Button variant="primary" type="submit" disabled={!username.trim()} class="w-full">
							Creer
						</Button>
					</form>

					<form onsubmit={handleJoinRoom} class="space-y-3">
						<Input
							bind:value={roomCode}
							placeholder="Code (ex: AB1234)..."
							maxlength={GAME_CONSTANTS.ROOM_CODE_LENGTH}
							class="text-center tracking-widest uppercase"
						/>
						<Button
							variant="default"
							type="submit"
							disabled={!username.trim() ||
								roomCode.trim().length !== GAME_CONSTANTS.ROOM_CODE_LENGTH}
							class="w-full"
						>
							Rejoindre
						</Button>
					</form>
				</div>
			</Card>
		{/if}
	</div>

	<div class="space-y-3">
		<h3 class="text-xs tracking-widest text-subtle uppercase">tableau des scores</h3>
		<LeaderboardList scores={highScores} />
	</div>
</div>
