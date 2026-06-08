<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	let {
		score,
		highScores = $bindable(),
		onReplay,
		onMenu
	}: {
		score: number;
		highScores: import('$lib/types').ScoreEntry[];
		onReplay: () => void;
		onMenu: () => void;
	} = $props();

	let username = $state('');
	let saving = $state(false);
	let saveSuccess = $state(false);
	let saveError = $state<string | null>(null);
</script>

<div class="mx-auto w-full max-w-sm space-y-6">
	<Card class="text-center">
		<div class="space-y-4">
			<p class="text-xs tracking-widest text-subtle uppercase">score final</p>
			<p class="text-5xl font-bold tabular-nums">{score}</p>
		</div>
	</Card>

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
						highScores = [
							...highScores,
							{
								id: Math.random().toString(),
								username: username || 'Anonyme',
								score,
								mode: 'time_attack',
								createdAt: new Date().toISOString()
							}
						]
							.sort((a, b) => b.score - a.score)
							.slice(0, 10);
					} else if (result.type === 'failure') {
						saveError = (result.data as { error?: string })?.error || 'Erreur de sauvegarde.';
					} else {
						saveError = 'Erreur inattendue.';
					}
				};
			}}
			class="space-y-3"
		>
			<input type="hidden" name="score" value={score} />
			<input type="hidden" name="mode" value="time_attack" />
			<div class="flex gap-2">
				<input
					type="text"
					name="username"
					bind:value={username}
					placeholder="pseudo..."
					maxlength="15"
					required
					class="flex-1 rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg placeholder:text-subtle focus:border-accent focus:outline-none"
				/>
				<Button variant="primary" type="submit" disabled={saving}>
					{saving ? '...' : 'Sauver'}
				</Button>
			</div>
			{#if saveError}
				<p class="text-xs text-danger">{saveError}</p>
			{/if}
		</form>
	{:else}
		<p class="text-center text-xs text-success">Score enregistre.</p>
	{/if}

	<div class="space-y-2">
		<Button variant="primary" onclick={onReplay} class="w-full">Rejouer</Button>
		<Button variant="ghost" onclick={onMenu} class="w-full">Accueil</Button>
	</div>
</div>
