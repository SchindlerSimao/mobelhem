<script lang="ts">
	let {
		value = $bindable(''),
		class: className = '',
		...rest
	}: {
		value?: string;
		class?: string;
		[key: string]: unknown;
	} = $props();
</script>

<input
	bind:value
	class="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg transition-colors placeholder:text-subtle focus:border-accent focus:outline-none {className}"
	{...rest}
/>
