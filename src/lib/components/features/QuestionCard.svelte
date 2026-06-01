<script lang="ts">
	import { fly } from 'svelte/transition';
	import type { GameItem } from '$lib/dataset';

	let {
		item,
		onGuess
	}: {
		item: GameItem;
		onGuess: (guess: 'ikea' | 'city' | 'both') => void;
	} = $props();
</script>

<!-- Question Content -->
<div class="relative z-10 my-auto space-y-4 py-6 text-center">
	<span class="text-xs font-bold tracking-widest text-slate-400 uppercase"
		>Le nom scandinave est...</span
	>
	<h3
		class="font-display text-4xl font-black tracking-widest text-slate-100 uppercase select-all sm:text-6xl"
	>
		{item.name}
	</h3>
</div>

<!-- Option Guessing Buttons -->
<div
	class="relative z-10 mt-6 grid grid-cols-1 gap-4 border-t border-slate-800/50 pt-6 sm:grid-cols-3"
	in:fly={{ y: 20, duration: 200 }}
>
	<button
		id="btn-guess-city"
		onclick={() => onGuess('city')}
		class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 p-4 font-bold tracking-wide text-slate-200 shadow-md transition-all hover:scale-[1.02] hover:border-sky-500/50 hover:from-slate-800 hover:to-slate-900 hover:text-sky-300"
	>
		<span class="text-xl">🗺️</span> Ville Scandinave
	</button>

	<button
		id="btn-guess-ikea"
		onclick={() => onGuess('ikea')}
		class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 p-4 font-bold tracking-wide text-slate-200 shadow-md transition-all hover:scale-[1.02] hover:border-amber-500/50 hover:from-slate-800 hover:to-slate-900 hover:text-amber-300"
	>
		<span class="text-xl">🛋️</span> Meuble IKEA
	</button>

	<button
		id="btn-guess-both"
		onclick={() => onGuess('both')}
		class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 p-4 font-bold tracking-wide text-slate-200 shadow-md transition-all hover:scale-[1.02] hover:border-purple-500/50 hover:from-slate-800 hover:to-slate-900 hover:text-purple-300"
	>
		<span class="text-xl">🔄</span> Les Deux !
	</button>
</div>
