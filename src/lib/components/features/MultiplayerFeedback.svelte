<script lang="ts">
	import type { GameItem, RoundPlayerResult } from '$lib/types';
	import Card from '$lib/components/ui/Card.svelte';
	import ItemDetails from './ItemDetails.svelte';

	let {
		item,
		playersResult = []
	}: {
		item: GameItem;
		playersResult: RoundPlayerResult[];
	} = $props();
</script>

<div class="grid gap-6 lg:grid-cols-2">
	<div class="space-y-4">
		<Card class="text-sm">
			<p class="mb-1 font-semibold">
				{item.name.toUpperCase()}
			</p>
			<p class="text-xs text-muted">
				{#if item.type === 'ikea'}Meuble IKEA uniquement.{/if}
				{#if item.type === 'city'}Ville uniquement.{/if}
				{#if item.type === 'both'}Meuble IKEA et lieu scandinave.{/if}
			</p>
		</Card>
		<ItemDetails {item} />
	</div>

	<Card>
		<p class="mb-3 text-xs tracking-widest text-subtle uppercase">classement manche</p>
		<div class="max-h-[280px] space-y-1 overflow-y-auto">
			{#each playersResult as player, i (player.id)}
				<div
					class="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2 text-sm"
				>
					<div class="flex items-center gap-2">
						<span class="text-xs text-subtle">#{i + 1}</span>
						<span class="font-medium">{player.username}</span>
					</div>
					<div class="flex items-center gap-2">
						{#if player.lastVote}
							<span
								class="rounded px-1.5 py-0.5 text-[10px] uppercase {player.lastVoteCorrect
									? 'text-success'
									: 'text-danger'}"
							>
								{player.lastVote === 'ikea' ? 'ikea' : 'ville'}
							</span>
						{:else}
							<span class="text-[10px] text-subtle">-</span>
						{/if}
						<span class="font-semibold tabular-nums">{player.score}</span>
					</div>
				</div>
			{/each}
		</div>
	</Card>
</div>
