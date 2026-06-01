<script lang="ts">
	import { scale } from 'svelte/transition';

	let {
		roomCode,
		onSubmit
	}: {
		roomCode: string;
		onSubmit: (pseudo: string) => void;
	} = $props();

	let pseudo = $state('');

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (pseudo.trim()) {
			onSubmit(pseudo.trim());
		}
	}
</script>

<div
	in:scale={{ duration: 250, start: 0.95 }}
	class="mx-auto w-full max-w-md space-y-4 rounded-3xl border border-slate-800/80 bg-slate-900/50 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
>
	<div class="space-y-1 text-center">
		<h2 class="text-2xl font-bold text-slate-200">Rejoindre le salon {roomCode}</h2>
		<p class="text-xs text-slate-400">Veuillez saisir votre pseudonyme pour participer au jeu.</p>
	</div>

	<form onsubmit={handleSubmit} class="space-y-4 pt-2">
		<input
			type="text"
			bind:value={pseudo}
			placeholder="Votre pseudonyme..."
			maxlength="12"
			required
			class="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 transition-colors focus:border-sky-500 focus:outline-none"
		/>
		<button
			type="submit"
			class="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 font-extrabold tracking-wide text-slate-950 transition-all hover:from-sky-400 hover:to-blue-500 hover:shadow-xl"
		>
			Confirmer et Rejoindre
		</button>
	</form>
</div>
