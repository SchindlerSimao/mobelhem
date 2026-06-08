<script lang="ts">
	import type { GameItem } from '$lib/dataset';
	import ItemDetails from './ItemDetails.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		item,
		isCorrect,
		onNext
	}: {
		item: GameItem;
		isCorrect: boolean | null;
		onNext: () => void;
	} = $props();
</script>

<div class="flex flex-1 flex-col justify-center gap-6">
	<div
		class="rounded-md border px-4 py-3 text-sm {isCorrect
			? 'border-success/30 bg-success/10 text-success'
			: 'border-danger/30 bg-danger/10 text-danger'}"
	>
		<p class="font-semibold">
			{isCorrect ? 'Bonne reponse.' : 'Mauvaise reponse.'}
		</p>
		<p class="mt-1 text-xs opacity-80">
			<b class="uppercase">{item.name}</b> est
			{#if item.type === 'ikea'}un meuble IKEA uniquement.{/if}
			{#if item.type === 'city'}une ville uniquement.{/if}
			{#if item.type === 'both'}a la fois un meuble IKEA et un vrai lieu scandinave.{/if}
		</p>
	</div>

	<ItemDetails {item} />

	<div class="flex justify-end">
		<Button variant="primary" onclick={onNext}>Question suivante</Button>
	</div>
</div>
