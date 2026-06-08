<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		padding = true,
		children,
		...rest
	}: {
		class?: string;
		padding?: boolean;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<div
	class="rounded-md border border-border bg-surface {padding ? 'p-6' : ''} {className}"
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</div>
