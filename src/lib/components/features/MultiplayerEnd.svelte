<script lang="ts">
	import { scale } from 'svelte/transition';

	interface Player {
		username: string;
		score: number;
	}

	let {
		players = [],
		onLeave
	}: {
		players: Player[];
		onLeave: () => void;
	} = $props();
</script>

<div
	in:scale={{ duration: 250, start: 0.95 }}
	class="mx-auto w-full max-w-md space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8"
>
	<!-- Header -->
	<div class="space-y-2">
		<span class="text-5xl">🏆</span>
		<h2 class="font-display text-3xl font-black tracking-tight text-slate-100">Fin de Partie !</h2>
		<p class="text-sm text-slate-400">
			Le catalogue a rendu son verdict. Voici le classement final :
		</p>
	</div>

	<!-- Leaderboard -->
	<div class="border-slate-850 space-y-2 rounded-2xl border bg-slate-950/40 p-4">
		{#each players as player, index (player.username)}
			<div
				class="border-slate-850 flex items-center justify-between rounded-xl border bg-slate-900/40 p-3 transition-colors hover:bg-slate-900/30"
			>
				<div class="flex items-center gap-3">
					<!-- Medal Badge -->
					<span
						class="flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-bold
						{index === 0 ? 'border border-amber-500/40 bg-amber-400/20 text-amber-300' : ''}
						{index === 1 ? 'border border-slate-400/40 bg-slate-400/20 text-slate-300' : ''}
						{index === 2 ? 'border border-amber-800/40 bg-amber-700/20 text-amber-600' : ''}
						{index > 2 ? 'bg-slate-800/40 text-slate-400' : ''}
					"
					>
						{#if index === 0}👑{:else}{index + 1}{/if}
					</span>
					<span class="text-sm font-semibold text-slate-200">{player.username}</span>
				</div>
				<span class="font-display text-sm font-bold text-sky-400">{player.score} pts</span>
			</div>
		{/each}
	</div>

	<!-- Action buttons -->
	<div class="pt-2">
		<button
			onclick={onLeave}
			class="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-3.5 font-extrabold tracking-wide text-slate-950 transition-all hover:from-sky-400 hover:to-blue-500 hover:shadow-xl hover:shadow-sky-500/10"
		>
			🏠 Retourner à l'accueil
		</button>
	</div>
</div>
