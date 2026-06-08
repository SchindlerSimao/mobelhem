<script lang="ts">
	import type { GameItem } from '$lib/dataset';

	let { item, onGuess }: {
		item: GameItem;
		onGuess: (guess: 'ikea' | 'city' | 'both') => void;
	} = $props();
</script>

<div class="flex flex-1 flex-col justify-center gap-8">
	<div class="space-y-3 text-center">
		<p class="text-xs uppercase tracking-widest text-subtle">le nom scandinave est...</p>
		<h2 class="text-4xl font-bold tracking-widest uppercase sm:text-5xl">
			{item.name}
		</h2>
	</div>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
		<button
			onclick={() => onGuess('city')}
			class="cursor-pointer rounded-md border border-border bg-surface px-4 py-4 text-sm font-medium transition-colors hover:bg-border hover:text-fg"
		>
			Ville Scandinave
		</button>
		<button
			onclick={() => onGuess('ikea')}
			class="cursor-pointer rounded-md border border-border bg-surface px-4 py-4 text-sm font-medium transition-colors hover:bg-border hover:text-fg"
		>
			Meuble IKEA
		</button>
		<button
			onclick={() => onGuess('both')}
			class="cursor-pointer rounded-md border border-border bg-surface px-4 py-4 text-sm font-medium transition-colors hover:bg-border hover:text-fg"
		>
			Les Deux
		</button>
	</div>
</div>
