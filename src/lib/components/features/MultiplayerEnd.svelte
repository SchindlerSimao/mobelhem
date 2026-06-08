<script lang="ts">
	import type { Player } from '$lib/types';
	import Button from '$lib/components/ui/Button.svelte';
	import PlayerList from '$lib/components/ui/PlayerList.svelte';

	let {
		players = [],
		onLeave
	}: {
		players: Player[];
		onLeave: () => void;
	} = $props();
</script>

<div class="mx-auto w-full max-w-sm space-y-6">
	<div class="text-center">
		<h2 class="text-2xl font-bold">Fin de Partie</h2>
		<p class="mt-1 text-xs text-muted">Classement final</p>
	</div>

	<PlayerList {players} showScore />

	<Button variant="primary" onclick={onLeave} class="w-full">Accueil</Button>
</div>
