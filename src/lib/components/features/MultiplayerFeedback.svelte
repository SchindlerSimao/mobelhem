<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { GameItem } from '$lib/dataset';

	interface RoundPlayerResult {
		id: string;
		username: string;
		score: number;
		lastVoteCorrect: boolean;
		lastVote: 'ikea' | 'city' | null;
		lastVoteTime: number;
	}

	let {
		item,
		playersResult = []
	}: {
		item: GameItem;
		playersResult: RoundPlayerResult[];
	} = $props();

	// Leaflet Custom Action for the map element
	function leafletMapAction(
		node: HTMLElement,
		coords: { lat: number; lng: number; name: string; desc?: string }
	) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (typeof window === 'undefined' || !(window as any).L) return;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const L = (window as any).L;

		const map = L.map(node, {
			center: [62, 15],
			zoom: 3,
			zoomControl: false,
			attributionControl: false
		});

		L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
			maxZoom: 20
		}).addTo(map);

		const customIcon = L.divIcon({
			className: 'custom-map-marker',
			html: `
				<div class="relative flex items-center justify-center">
					<div class="absolute w-8 h-8 rounded-full bg-emerald-400 border border-white opacity-70 animate-ping"></div>
					<div class="relative w-6 h-6 rounded-full bg-emerald-600 border border-white flex items-center justify-center shadow-lg">
						<span class="text-white text-[10px]">📍</span>
					</div>
				</div>
			`,
			iconSize: [24, 24],
			iconAnchor: [12, 12]
		});

		const marker = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(map);
		marker
			.bindPopup(
				`<b class="text-slate-900 font-display font-semibold text-sm">${coords.name}</b><br><span class="text-slate-600 text-xs">${coords.desc || ''}</span>`
			)
			.openPopup();

		setTimeout(() => {
			map.invalidateSize();
			map.flyTo([coords.lat, coords.lng], 6, {
				duration: 2,
				easeLinearity: 0.25
			});
		}, 300);

		return {
			destroy() {
				map.remove();
			}
		};
	}

	function getCountryName(country: 'SE' | 'NO' | 'DK' | 'FI' | null): string {
		if (!country) return '';
		const names = { SE: 'Suède', NO: 'Norvège', DK: 'Danemark', FI: 'Finlande' };
		return names[country] || '';
	}
</script>

<div class="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12" in:fade={{ duration: 200 }}>
	<!-- Left Side: Answer info + Map -->
	<div class="flex flex-col justify-between space-y-4 lg:col-span-7">
		<!-- Banner -->
		<div class="rounded-2xl border border-indigo-900/50 bg-indigo-950/40 p-4 text-indigo-300">
			<h4 class="flex items-center gap-2 text-base font-bold">
				✨ La réponse correcte : <span class="font-black text-slate-100 uppercase">{item.name}</span
				>
			</h4>
			<p class="mt-1 text-xs opacity-90">
				Le mot <b class="uppercase">{item.name}</b> est
				{#if item.type === 'ikea'}un <b>meuble IKEA uniquement</b>.{/if}
				{#if item.type === 'city'}une <b>ville uniquement</b>.{/if}
				{#if item.type === 'both'}à la fois un <b>meuble IKEA</b> ET un <b>vrai lieu scandinave</b> !{/if}
			</p>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<!-- Info cards -->
			<div class="flex flex-col justify-between space-y-3">
				<div>
					{#if item.type === 'city' || item.type === 'both'}
						<div class="rounded-2xl border border-slate-800/40 bg-slate-950/40 p-4">
							<h5 class="mb-1 text-xs font-bold tracking-wider text-sky-400 uppercase">
								🗺️ Géographie
							</h5>
							<p class="text-xs font-semibold text-slate-200">
								{item.name} ({getCountryName(item.country)})
							</p>
							<p class="mt-1 text-[11px] leading-relaxed text-slate-400">{item.cityDesc}</p>
						</div>
					{/if}

					{#if item.type === 'ikea' || item.type === 'both'}
						<div
							class="rounded-2xl border border-slate-800/40 bg-slate-950/40 p-4 {item.type ===
							'both'
								? 'mt-3'
								: ''}"
						>
							<h5 class="mb-1 text-xs font-bold tracking-wider text-amber-400 uppercase">
								🛋️ Design IKEA
							</h5>
							<p class="text-[11px] leading-relaxed text-slate-400">{item.ikeaDesc}</p>
						</div>
					{/if}
				</div>

				<div
					class="rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-4 text-[11px] leading-relaxed text-indigo-300"
				>
					💡 <b>Fun Fact:</b>
					{item.funFact}
				</div>
			</div>

			<!-- Leaflet map -->
			<div
				class="relative flex h-[240px] min-h-[220px] items-center justify-center overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950 shadow-inner sm:h-auto"
			>
				{#if item.lat && item.lng}
					<div
						id="leaflet-map"
						class="h-full w-full"
						use:leafletMapAction={{
							lat: Number(item.lat),
							lng: Number(item.lng),
							name: item.name,
							desc: item.cityDesc
						}}
					></div>
				{:else}
					<div class="space-y-2 p-6 text-center">
						<span class="block text-4xl">🛋️</span>
						<h5 class="text-xs font-bold text-slate-300">Pas de carte</h5>
						<p class="mx-auto max-w-[150px] text-[10px] text-slate-500">
							Produit nommé d'après un mot suédois, d'un prénom ou d'un concept non géographique.
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Right Side: Live scores in round -->
	<div
		class="border-slate-850 flex flex-col justify-between rounded-3xl border bg-slate-950/60 p-5 shadow-2xl lg:col-span-5"
	>
		<div class="space-y-4">
			<h4
				class="flex items-center justify-between border-b border-slate-800 pb-3 font-display text-sm font-bold tracking-wide"
			>
				<span>Classement de la Manche</span>
				<span class="animate-pulse text-xs font-normal text-slate-500">transition...</span>
			</h4>

			<div class="max-h-[285px] space-y-2 overflow-y-auto pr-1">
				{#each playersResult as player, index (player.id)}
					<div
						class="border-slate-850 flex items-center justify-between rounded-xl border bg-slate-900/40 p-3"
					>
						<div class="flex items-center gap-3">
							<span class="text-xs font-bold text-slate-500">#{index + 1}</span>
							<span class="text-sm font-semibold text-slate-200">{player.username}</span>
						</div>
						<div class="flex items-center gap-2">
							<!-- Answer indicator -->
							{#if player.lastVote}
								<span
									class="rounded px-2 py-0.5 text-[9px] font-bold uppercase
									{player.lastVoteCorrect
										? 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
										: 'border border-red-500/30 bg-red-500/20 text-red-400'}"
								>
									{player.lastVote === 'ikea' ? 'IKEA' : 'Ville'} ({(
										player.lastVoteTime / 1000
									).toFixed(2)}s)
								</span>
							{:else}
								<span class="text-[9px] text-slate-600 italic">Pas voté</span>
							{/if}

							<span class="text-sm font-bold text-sky-400">{player.score} pts</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
