<script lang="ts">
	import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		onHome,
		showLeave = false,
		leaveLabel = 'Quitter'
	}: {
		onHome: () => void;
		showLeave?: boolean;
		leaveLabel?: string;
	} = $props();
</script>

<header class="flex items-center justify-between border-b border-border pb-4">
	<button
		onclick={onHome}
		class="cursor-pointer border-none bg-transparent text-fg transition-opacity hover:opacity-60"
	>
		<span class="text-lg font-bold tracking-widest">MOBELHEM</span>
	</button>

	<div class="flex items-center gap-2">
		{#if showLeave}
			<Button variant="danger" onclick={onHome}>{leaveLabel}</Button>
		{/if}
		<ThemeToggle />
	</div>
</header>
