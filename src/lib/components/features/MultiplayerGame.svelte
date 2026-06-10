<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import TimerBar from '$lib/components/ui/TimerBar.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let {
		wordName,
		roundIndex,
		totalRounds,
		timeLeft,
		voted,
		votedPlayers = [],
		playersCount = 0,
		onVote
	}: {
		wordName: string;
		roundIndex: number;
		totalRounds: number;
		timeLeft: number;
		voted: boolean;
		votedPlayers: string[];
		playersCount: number;
		onVote: (vote: 'ikea' | 'city' | 'both') => void;
	} = $props();
</script>

<div class="space-y-4">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<Badge label="Manche" value="{roundIndex + 1}/{totalRounds}" />
		<TimerBar {timeLeft} max={8} class="w-48" />
	</div>

	<Card class="flex min-h-[320px] flex-col justify-center gap-8">
		<div class="space-y-3 text-center">
			<p class="text-xs tracking-widest text-subtle uppercase">ville ou meuble ?</p>
			<h2 class="text-4xl font-bold tracking-widest uppercase sm:text-5xl">{wordName}</h2>
		</div>

		<div class="grid grid-cols-3 gap-3">
			<button
				disabled={voted}
				onclick={() => onVote('city')}
				class="cursor-pointer rounded-md border border-border bg-surface px-4 py-4 text-sm font-medium transition-colors
					{voted ? 'pointer-events-none opacity-30' : 'hover:bg-border hover:text-fg'}"
			>
				Ville Scandinave
			</button>
			<button
				disabled={voted}
				onclick={() => onVote('ikea')}
				class="cursor-pointer rounded-md border border-border bg-surface px-4 py-4 text-sm font-medium transition-colors
					{voted ? 'pointer-events-none opacity-30' : 'hover:bg-border hover:text-fg'}"
			>
				Meuble IKEA
			</button>
			<button
				disabled={voted}
				onclick={() => onVote('both')}
				class="cursor-pointer rounded-md border border-border bg-surface px-4 py-4 text-sm font-medium transition-colors
					{voted ? 'pointer-events-none opacity-30' : 'hover:bg-border hover:text-fg'}"
			>
				Les Deux
			</button>
		</div>

		{#if votedPlayers.length > 0}
			<p class="text-center text-xs text-subtle">
				votes: {votedPlayers.length}/{playersCount}
			</p>
		{/if}
	</Card>
</div>
