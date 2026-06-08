<script lang="ts">
	import type { Player } from '$lib/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PlayerList from '$lib/components/ui/PlayerList.svelte';

	let {
		code,
		players = [],
		isHost,
		onStart,
		onLeave
	}: {
		code: string;
		players: Player[];
		isHost: boolean;
		onStart: () => void;
		onLeave: () => void;
	} = $props();

	let copied = $state(false);

	function copyUrl() {
		if (typeof window === 'undefined') return;
		const url = `${window.location.origin}/room/${code}`;
		navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="mx-auto w-full max-w-sm space-y-6">
	<Card class="space-y-4 text-center">
		<p class="text-xs tracking-widest text-subtle uppercase">code du salon</p>
		<p class="text-4xl font-bold tracking-widest uppercase select-all">{code}</p>
		<button
			onclick={copyUrl}
			class="cursor-pointer border-none bg-transparent text-xs text-muted transition-colors hover:text-fg"
		>
			{copied ? 'copie' : 'copier le lien'}
		</button>
	</Card>

	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<p class="text-xs tracking-widest text-subtle uppercase">
				joueurs ({players.length})
			</p>
			<span class="animate-pulse text-[10px] text-muted">en attente...</span>
		</div>
		<PlayerList {players} />
	</div>

	<div class="space-y-2">
		{#if isHost}
			<Button variant="primary" onclick={onStart} disabled={players.length < 1} class="w-full">
				Commencer
			</Button>
		{:else}
			<p class="text-center text-xs text-muted italic">L'hote lancera la partie.</p>
		{/if}
		<Button variant="ghost" onclick={onLeave} class="w-full">Accueil</Button>
	</div>
</div>
