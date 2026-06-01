<script lang="ts">
	import { scale } from 'svelte/transition';
	import { enhance } from '$app/forms';

	interface ScoreEntry {
		id: string;
		username: string;
		score: number;
		mode: string;
		createdAt: string;
	}

	let {
		score,
		highScores = $bindable(),
		onReplay,
		onMenu
	}: {
		score: number;
		highScores: ScoreEntry[];
		onReplay: () => void;
		onMenu: () => void;
	} = $props();

	// Form actions local states
	let username = $state('');
	let saving = $state(false);
	let saveSuccess = $state(false);
	let saveError = $state<string | null>(null);
</script>

<div
	class="mx-auto w-full max-w-md space-y-6 rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8"
	in:scale={{ duration: 250, start: 0.95 }}
>
	<div class="space-y-2">
		<span class="text-5xl">🏁</span>
		<h2 class="font-display text-3xl font-black tracking-tight text-slate-100">
			Partie Terminée !
		</h2>
		<p class="text-xs text-slate-400">
			Félicitations pour votre parcours en mode <b>Contre la montre</b> !
		</p>
	</div>

	<!-- Score Display Card -->
	<div class="border-slate-850 rounded-2xl border bg-slate-950/60 p-6">
		<span class="text-xs font-bold tracking-widest text-slate-500 uppercase">Votre score final</span
		>
		<div class="mt-2 font-display text-5xl font-black text-emerald-400">{score}</div>
		<span class="mt-1 block text-xs text-slate-500">points cumulés</span>
	</div>

	<!-- Save Score Form -->
	{#if !saveSuccess}
		<form
			method="POST"
			action="?/saveScore"
			use:enhance={() => {
				saving = true;
				saveError = null;
				return async ({ result }) => {
					saving = false;
					if (result.type === 'success') {
						saveSuccess = true;
						// Optimistically update locally bound data
						highScores = [
							...highScores,
							{
								id: Math.random().toString(),
								username: username || 'Anonyme',
								score: score,
								mode: 'time_attack',
								createdAt: new Date().toISOString()
							}
						]
							.sort((a, b) => b.score - a.score)
							.slice(0, 10);
					} else {
						saveError = 'Une erreur est survenue lors de la sauvegarde.';
					}
				};
			}}
			class="my-2 space-y-3 border-t border-b border-slate-800/60 py-4 text-left"
		>
			<h4 class="text-sm font-bold text-slate-200">Enregistrer votre score</h4>
			<input type="hidden" name="score" value={score} />
			<input type="hidden" name="mode" value="time_attack" />

			<div class="flex gap-2">
				<input
					type="text"
					name="username"
					bind:value={username}
					placeholder="Votre pseudonyme..."
					maxlength="15"
					required
					class="flex-grow rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition-colors focus:border-emerald-500 focus:outline-none"
				/>
				<button
					id="btn-save-score"
					type="submit"
					disabled={saving}
					class="cursor-pointer rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
				>
					{saving ? 'Enregistrement...' : 'Enregistrer'}
				</button>
			</div>

			{#if saveError}
				<p class="mt-1 text-xs text-red-400">{saveError}</p>
			{/if}
		</form>
	{:else}
		<div
			class="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-400"
		>
			✅ Score enregistré avec succès dans le tableau !
		</div>
	{/if}

	<!-- Action Buttons -->
	<div class="flex flex-col gap-2 pt-2">
		<button
			id="btn-replay"
			onclick={onReplay}
			class="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 font-extrabold tracking-wide text-slate-950 shadow-md transition-all hover:from-emerald-400 hover:to-teal-500"
		>
			🔄 Rejouer
		</button>

		<button
			id="btn-menu"
			onclick={onMenu}
			class="bg-slate-850 w-full cursor-pointer rounded-2xl border border-slate-800 py-3 text-sm font-bold text-slate-300 transition-all hover:bg-slate-800"
		>
			🏠 Retourner à l'accueil
		</button>
	</div>
</div>
