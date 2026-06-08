<script lang="ts">
	import type { Snippet } from 'svelte';

	let { variant = 'default', class: className = '', disabled = false, children, ...rest }: {
		variant?: 'default' | 'primary' | 'ghost' | 'danger';
		class?: string;
		disabled?: boolean;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<button
	class="inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40
		{variant === 'default' ? 'border border-border bg-surface text-fg hover:bg-border' : ''}
		{variant === 'primary' ? 'bg-accent text-accent-fg hover:opacity-90' : ''}
		{variant === 'ghost' ? 'text-muted hover:bg-surface hover:text-fg' : ''}
		{variant === 'danger' ? 'border border-border text-danger hover:bg-danger/10' : ''}
		{className}"
	{disabled}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</button>
