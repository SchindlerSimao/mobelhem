<script lang="ts">
	import type { GameItem } from '$lib/types';
	import { COUNTRY_NAMES } from '$lib/types';
	import Map from '$lib/components/ui/Map.svelte';

	let { item }: { item: GameItem } = $props();

	let hasCoords = $derived(item.lat != null && item.lng != null);
	let isCity = $derived(item.type === 'city' || item.type === 'both');
</script>

<div class="grid gap-4 md:grid-cols-2">
	<div class="space-y-3">
		{#if isCity}
			<div class="rounded-md border border-border bg-surface p-4">
				<p class="mb-1 text-xs uppercase tracking-wider text-subtle">geographie</p>
				<p class="text-sm font-medium">
					{item.name} ({COUNTRY_NAMES[item.country ?? ''] ?? ''})
				</p>
				{#if item.cityDesc}
					<p class="mt-1 text-xs leading-relaxed text-muted">{item.cityDesc}</p>
				{/if}
			</div>
		{/if}
	</div>

	{#if hasCoords}
		<Map lat={item.lat!} lng={item.lng!} name={item.name} desc={item.cityDesc} />
	{:else}
		<div class="flex h-[200px] items-center justify-center rounded-md border border-border bg-surface">
			<p class="text-xs text-subtle">pas de coordonnees geographiques</p>
		</div>
	{/if}
</div>
