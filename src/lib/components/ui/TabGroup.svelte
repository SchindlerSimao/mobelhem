<script lang="ts">
	let {
		tabs,
		active,
		onChange
	}: {
		tabs: { id: string; label: string }[];
		active: string;
		onChange: (id: string) => void;
	} = $props();
</script>

<div class="inline-flex rounded-md border border-border bg-surface p-0.5" role="tablist">
	{#each tabs as tab (tab.id)}
		<button
			role="tab"
			aria-selected={active === tab.id}
			onclick={() => onChange(tab.id)}
			class="cursor-pointer rounded-[5px] px-4 py-1.5 text-xs font-medium transition-colors
				{active === tab.id ? 'bg-accent text-accent-fg' : 'text-muted hover:text-fg'}"
		>
			{tab.label}
		</button>
	{/each}
</div>
