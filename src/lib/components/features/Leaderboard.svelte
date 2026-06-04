<script lang="ts">
	type GameMode = 'time_attack' | 'multiplayer';

	interface ScoreEntry {
		id: string;
		username: string;
		score: number;
		mode: string;
		createdAt: string;
	}

	let {
		highScores = []
	}: {
		highScores: ScoreEntry[];
	} = $props();

	let activeTab = $state<GameMode>('time_attack');
	let filteredScores = $derived(highScores.filter((s) => s.mode === activeTab));
</script>

<div class="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-md">
	<div class="mb-4 flex items-center justify-between border-b border-slate-800/80 pb-4">
		<h3 class="flex items-center gap-2 font-display text-lg font-bold tracking-wide">
			📊 Tableau des Scores
		</h3>

		<!-- Leaderboard Tab Toggles -->
		<div class="flex rounded-xl border border-slate-800/60 bg-slate-950/60 p-1 text-xs">
			<button
				onclick={() => (activeTab = 'time_attack')}
				class="rounded-lg px-3 py-1.5 font-medium transition-colors {activeTab === 'time_attack'
					? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
					: 'text-slate-400'}"
			>
				Chrono
			</button>
			<button
				onclick={() => (activeTab = 'multiplayer')}
				class="rounded-lg px-3 py-1.5 font-medium transition-colors {activeTab === 'multiplayer'
					? 'border border-sky-500/30 bg-sky-500/20 text-sky-400'
					: 'text-slate-400'}"
			>
				Multijoueur
			</button>
		</div>
	</div>

	<!-- Leaderboard List -->
	<div class="max-h-[300px] space-y-2 overflow-y-auto pr-1">
		{#if filteredScores.length === 0}
			<div class="py-10 text-center text-sm text-slate-500">
				Aucun score enregistré pour le moment.<br />Soyez le premier à inscrire le vôtre !
			</div>
		{:else}
			{#each filteredScores as entry, index (entry.id || index)}
				<div
					class="border-slate-850 flex items-center justify-between rounded-xl border bg-slate-950/40 p-3 transition-colors hover:bg-slate-900/30"
				>
					<div class="flex items-center gap-3">
						<!-- Medal Badge -->
						<span
							class="flex h-6 w-6 items-center justify-center rounded-full font-display text-xs font-bold
							{index === 0 ? 'border border-amber-500/40 bg-amber-400/20 text-amber-300' : ''}
							{index === 1 ? 'border border-slate-400/40 bg-slate-400/20 text-slate-300' : ''}
							{index === 2 ? 'border border-amber-800/40 bg-amber-700/20 text-amber-600' : ''}
							{index > 2 ? 'bg-slate-800/40 text-slate-400' : ''}
						"
						>
							{index + 1}
						</span>
						<span class="text-sm font-semibold text-slate-200">{entry.username}</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-xs text-slate-500">
							{new Date(entry.createdAt).toLocaleDateString('fr-FR', {
								day: '2-digit',
								month: 'short'
							})}
						</span>
						<span
							class="font-display text-sm font-bold
							{activeTab === 'time_attack' ? 'text-emerald-400' : 'text-sky-400'}
						"
						>
							{entry.score} pts
						</span>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
