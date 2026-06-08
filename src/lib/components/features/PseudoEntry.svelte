<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';

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
		if (pseudo.trim()) onSubmit(pseudo.trim());
	}
</script>

<div class="mx-auto w-full max-w-sm">
	<Card class="space-y-4 text-center">
		<h2 class="text-lg font-bold">Rejoindre {roomCode}</h2>
		<p class="text-xs text-muted">Saisir votre pseudonyme pour participer.</p>
		<form onsubmit={handleSubmit} class="space-y-3">
			<Input bind:value={pseudo} placeholder="pseudo..." maxlength={12} required />
			<Button variant="primary" type="submit" class="w-full">Rejoindre</Button>
		</form>
	</Card>
</div>
