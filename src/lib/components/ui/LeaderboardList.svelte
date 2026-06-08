<script lang="ts">
	import type { ScoreEntry } from '$lib/types';

	let {
		scores = []
	}: {
		scores: ScoreEntry[];
	} = $props();
</script>

<div class="space-y-1">
	{#if scores.length === 0}
		<p class="py-8 text-center text-xs text-subtle">Aucun score enregistre.</p>
	{:else}
		{#each scores as entry, i (entry.id || i)}
			<div
				class="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm transition-colors hover:bg-border/50"
			>
				<div class="flex items-center gap-3">
					<span class="w-5 text-right text-xs text-subtle tabular-nums">
						{i + 1}
					</span>
					<span class="font-medium">{entry.username}</span>
				</div>
				<span class="font-semibold tabular-nums">{entry.score}</span>
			</div>
		{/each}
	{/if}
</div>
