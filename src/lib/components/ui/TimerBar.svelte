<script lang="ts">
	let {
		timeLeft,
		max = 60,
		class: className = ''
	}: {
		timeLeft: number;
		max?: number;
		class?: string;
	} = $props();

	let pct = $derived(Math.max(0, (timeLeft / max) * 100));
	let urgent = $derived(timeLeft <= 10);
	let critical = $derived(timeLeft <= 3);
</script>

<div class="flex items-center gap-3 {className}">
	<div class="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border">
		<div
			class="h-full rounded-full transition-all duration-1000 {critical
				? 'animate-pulse bg-danger'
				: urgent
					? 'bg-muted'
					: 'bg-fg'}"
			style="width: {pct}%"
		></div>
	</div>
	<span
		class="w-8 text-right text-sm font-semibold tabular-nums {critical ? 'text-danger' : 'text-fg'}"
	>
		{timeLeft}
	</span>
</div>
