<script lang="ts">
	let {
		label,
		value,
		class: className = ''
	}: {
		label: string;
		value: string | number;
		class?: string;
	} = $props();
</script>

<div class="inline-flex items-center gap-2 text-sm {className}">
	<span class="text-xs tracking-wider text-subtle uppercase">{label}</span>
	<span class="font-semibold tabular-nums">{value}</span>
</div>
