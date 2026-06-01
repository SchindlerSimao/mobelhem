<script lang="ts">
	import { scale } from 'svelte/transition';

	interface Player {
		username: string;
		isHost: boolean;
		score: number;
	}

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

<div
	in:scale={{ duration: 250, start: 0.95 }}
	class="mx-auto w-full max-w-md space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8"
>
	<!-- Title & Code -->
	<div class="space-y-2">
		<span class="text-xs font-bold tracking-widest text-slate-500 uppercase">Code du salon</span>
		<h2
			class="border-slate-850 rounded-2xl border bg-slate-950/60 py-3 font-display text-5xl font-black tracking-wider text-sky-400 uppercase select-all"
		>
			{code}
		</h2>
		<button
			onclick={copyUrl}
			class="mx-auto mt-2 flex cursor-pointer items-center gap-1.5 border-none bg-transparent text-xs text-slate-400 transition-colors hover:text-sky-400"
		>
			🔗 {copied ? 'Lien copié !' : "Copier le lien d'invitation"}
		</button>
	</div>

	<!-- Players list -->
	<div class="space-y-3 text-left">
		<h4
			class="flex items-center justify-between text-xs font-bold tracking-widest text-slate-400 uppercase"
		>
			<span>Joueurs ({players.length})</span>
			<span class="animate-pulse text-[10px] font-normal text-emerald-400 lowercase"
				>en attente...</span
			>
		</h4>

		<div
			class="border-slate-850 max-h-[200px] space-y-2 overflow-y-auto rounded-2xl border bg-slate-950/40 p-4"
		>
			{#each players as player (player.username)}
				<div
					class="flex items-center justify-between border-b border-slate-900/50 py-1.5 last:border-none"
				>
					<span class="flex items-center gap-2 text-sm font-semibold text-slate-200">
						👤 {player.username}
						{#if player.isHost}
							<span
								class="rounded border border-sky-500/30 bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300 uppercase"
								>Hôte</span
							>
						{/if}
					</span>
					<span class="text-xs font-medium text-slate-500">Prêt</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Action buttons -->
	<div class="space-y-2 pt-2">
		{#if isHost}
			<button
				onclick={onStart}
				disabled={players.length < 1}
				class="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 font-extrabold tracking-wide text-slate-950 shadow-md transition-all hover:from-emerald-400 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
			>
				🚀 Commencer la Partie
			</button>
		{:else}
			<div
				class="border-slate-850 rounded-2xl border bg-slate-950/60 p-3 text-xs leading-relaxed text-slate-400 italic"
			>
				L'hôte lancera la partie dès que tout le monde aura rejoint.
			</div>
		{/if}

		<button
			onclick={onLeave}
			class="bg-slate-850 hover:bg-slate-850/80 w-full cursor-pointer rounded-2xl border border-slate-800 py-3 text-xs font-bold text-slate-300 transition-all"
		>
			🏠 Retourner à l'accueil
		</button>
	</div>
</div>
