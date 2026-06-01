<script lang="ts">
	import { scale } from 'svelte/transition';

	let {
		label,
		value,
		color = 'emerald',
		animate = false
	}: {
		label: string;
		value: string | number;
		color?: 'emerald' | 'sky' | 'indigo' | 'purple' | 'red' | 'amber';
		animate?: boolean;
	} = $props();

	const colorClasses = {
		emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400',
		sky: 'from-sky-500/10 to-blue-500/10 border-sky-500/20 text-sky-400',
		indigo: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-indigo-400',
		purple: 'from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-400',
		red: 'from-red-500/10 to-rose-500/10 border-red-500/20 text-red-400',
		amber: 'from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-400'
	};
</script>

{#if animate}
	<div
		in:scale
		class="flex items-center gap-2 rounded-xl border bg-gradient-to-br px-4 py-2 text-sm font-medium shadow-md {colorClasses[
			color
		]}"
	>
		<span class="text-xs font-bold tracking-wider text-slate-400 uppercase">{label}:</span>
		<span class="font-display text-base leading-none font-bold">{value}</span>
	</div>
{:else}
	<div
		class="flex items-center gap-2 rounded-xl border bg-gradient-to-br px-4 py-2 text-sm font-medium shadow-md {colorClasses[
			color
		]}"
	>
		<span class="text-xs font-bold tracking-wider text-slate-400 uppercase">{label}:</span>
		<span class="font-display text-base leading-none font-bold">{value}</span>
	</div>
{/if}
