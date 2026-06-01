<script lang="ts">
	import { scale, fly } from 'svelte/transition';
	import Badge from '../ui/Badge.svelte';

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
		onVote: (vote: 'ikea' | 'city') => void;
	} = $props();
</script>

<div class="mx-auto w-full max-w-4xl space-y-6" in:scale={{ duration: 250, start: 0.95 }}>
	<!-- Top Stats Bar -->
	<div
		class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/30 px-6 py-4 shadow-lg backdrop-blur-sm"
	>
		<Badge label="Manche" value={`${roundIndex + 1} / ${totalRounds}`} color="emerald" />

		<!-- Shared Chrono -->
		<div class="flex max-w-xs flex-grow items-center gap-3">
			<span class="text-xs font-bold tracking-widest text-slate-400 uppercase">Temps restant:</span>
			<div
				class="relative h-3 flex-grow overflow-hidden rounded-full border border-slate-800/50 bg-slate-950"
			>
				<div
					class="h-full rounded-full transition-all duration-1000
						{timeLeft > 4 ? 'bg-gradient-to-r from-emerald-500 to-sky-500' : ''}
						{timeLeft <= 4 && timeLeft > 2 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : ''}
						{timeLeft <= 2 ? 'animate-pulse bg-red-500' : ''}
					"
					style="width: {(timeLeft / 8) * 100}%"
				></div>
			</div>
			<span
				class="font-display text-sm font-bold {timeLeft <= 2
					? 'animate-bounce text-red-400'
					: 'text-slate-200'}">{timeLeft}s</span
			>
		</div>
	</div>

	<!-- Game card -->
	<div
		class="relative flex min-h-[350px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl lg:p-8"
	>
		<div
			class="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 opacity-20 blur-[100px]"
		></div>

		<!-- Question word -->
		<div class="relative z-10 my-auto space-y-4 py-6 text-center">
			<span class="text-xs font-bold tracking-widest text-slate-400 uppercase"
				>Est-ce une ville ou un meuble ?</span
			>
			<h3
				class="font-display text-4xl font-black tracking-widest text-slate-100 uppercase select-all sm:text-6xl"
			>
				{wordName}
			</h3>
		</div>

		<!-- Vote choices -->
		<div
			class="relative z-10 mt-6 grid grid-cols-1 gap-4 border-t border-slate-800/50 pt-6 sm:grid-cols-2"
		>
			<button
				disabled={voted}
				onclick={() => onVote('city')}
				class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 p-5 font-bold tracking-wide text-slate-200 shadow-md transition-all
					{voted
					? 'cursor-not-allowed border-slate-900 opacity-40'
					: 'hover:scale-[1.02] hover:border-sky-500/50 hover:from-slate-800 hover:to-slate-900 hover:text-sky-300'}"
			>
				<span class="text-2xl">🗺️</span> Ville Scandinave
			</button>

			<button
				disabled={voted}
				onclick={() => onVote('ikea')}
				class="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 to-slate-950 p-5 font-bold tracking-wide text-slate-200 shadow-md transition-all
					{voted
					? 'cursor-not-allowed border-slate-900 opacity-40'
					: 'hover:scale-[1.02] hover:border-amber-500/50 hover:from-slate-800 hover:to-slate-900 hover:text-amber-300'}"
			>
				<span class="text-2xl">🛋️</span> Meuble IKEA
			</button>
		</div>

		<!-- Live votes tracking -->
		{#if votedPlayers.length > 0}
			<div
				class="relative z-10 pt-4 text-center text-xs text-slate-500 italic"
				in:fly={{ y: 5, duration: 150 }}
			>
				🗳️ A voté ({votedPlayers.length} / {playersCount}) : {votedPlayers.join(', ')}
			</div>
		{/if}
	</div>
</div>
