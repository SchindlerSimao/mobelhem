<script lang="ts">
	import type { Player } from '$lib/types';

	let { players = [], showScore = false }: {
		players: Player[];
		showScore?: boolean;
	} = $props();
</script>

<div class="space-y-1">
	{#each players as player, i (player.id)}
		<div
			class="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2 text-sm"
		>
			<div class="flex items-center gap-3">
				<span class="w-5 text-right text-xs tabular-nums text-subtle">
					{i + 1}
				</span>
				<span class="font-medium">{player.username}</span>
				{#if player.isHost}
					<span class="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-subtle">
						hote
					</span>
				{/if}
			</div>
			{#if showScore}
				<span class="tabular-nums font-semibold">{player.score}</span>
			{:else}
				<span class="text-xs text-subtle">pret</span>
			{/if}
		</div>
	{/each}
</div>
