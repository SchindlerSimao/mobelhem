<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { GameItem } from '$lib/dataset';

	let {
		item,
		isCorrect,
		onNext
	}: {
		item: GameItem;
		isCorrect: boolean | null;
		onNext: () => void;
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

<div
	class="relative z-10 mt-6 space-y-6 border-t border-slate-800/50 pt-6"
	in:fade={{ duration: 200 }}
>
	<!-- Result Header banner -->
	<div
		class="flex items-center gap-3 rounded-2xl p-4 {isCorrect
			? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
			: 'border border-red-500/20 bg-red-500/10 text-red-400'}"
	>
		<span class="text-2xl">{isCorrect ? '✨' : '❌'}</span>
		<div>
			<h4 class="text-base font-bold">
				{isCorrect ? 'Excellent ! Bonne réponse.' : 'Dommage, mauvaise réponse !'}
			</h4>
			<p class="mt-0.5 text-xs opacity-85">
				Le mot <b class="uppercase">{item.name}</b> est
				{#if item.type === 'ikea'}
					un <b>meuble IKEA uniquement</b>.{/if}
				{#if item.type === 'city'}
					une <b>ville uniquement</b>.{/if}
				{#if item.type === 'both'}
					à la fois un <b>meuble IKEA</b> ET un <b>vrai lieu scandinave</b> !{/if}
			</p>
		</div>
	</div>

	<!-- Explanatory content columns (Text + Map) -->
	<div class="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
		<!-- Text explanation block -->
		<div class="flex flex-col justify-between space-y-4">
			<div class="space-y-3">
				<!-- City Info (if applicable) -->
				{#if item.type === 'city' || item.type === 'both'}
					<div class="rounded-2xl border border-slate-800/40 bg-slate-950/40 p-4">
						<h5 class="mb-1 text-xs font-bold tracking-wider text-sky-400 uppercase">
							🗺️ Géographie
						</h5>
						<p class="text-sm font-semibold text-slate-200">
							{item.name} ({getCountryName(item.country)})
						</p>
						<p class="mt-1 text-xs leading-relaxed text-slate-400">{item.cityDesc}</p>
					</div>
				{/if}

				<!-- IKEA Info (if applicable) -->
				{#if item.type === 'ikea' || item.type === 'both'}
					<div class="rounded-2xl border border-slate-800/40 bg-slate-950/40 p-4">
						<h5 class="mb-1 text-xs font-bold tracking-wider text-amber-400 uppercase">
							🛋️ Design IKEA
						</h5>
						<p class="text-xs leading-relaxed text-slate-400">{item.ikeaDesc}</p>
					</div>
				{/if}
			</div>

			<!-- Fun Fact block -->
			<div
				class="rounded-2xl border border-indigo-500/10 bg-indigo-500/5 p-4 text-xs leading-relaxed text-indigo-300"
			>
				💡 <b>Le saviez-vous ?</b>
				{item.funFact}
			</div>
		</div>

		<!-- Interactive Leaflet map container -->
		<div
			class="relative flex h-[230px] items-center justify-center overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950 shadow-inner"
		>
			{#if item.lat && item.lng}
				<div
					id="leaflet-map"
					class="h-full w-full"
					use:leafletMapAction={{
						lat: item.lat,
						lng: item.lng,
						name: item.name,
						desc: item.cityDesc
					}}
				></div>
			{:else}
				<!-- Non-geographic block -->
				<div class="space-y-2 p-6 text-center">
					<span class="block text-4xl">🛋️</span>
					<h5 class="text-sm font-bold text-slate-300">Pas de coordonnées géographiques</h5>
					<p class="mx-auto max-w-[250px] text-xs text-slate-500">
						Ce produit porte le nom d'un mot suédois, d'un prénom ou d'un concept abstrait non
						géographique.
					</p>
				</div>
			{/if}
		</div>
	</div>

	<!-- Next Question Button -->
	<div class="flex justify-end pt-4" in:fly={{ y: 10, duration: 150 }}>
		<button
			id="btn-next-question"
			onclick={onNext}
			class="flex cursor-pointer items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-3.5 font-extrabold tracking-wide text-slate-950 shadow-md transition-all hover:from-emerald-400 hover:to-teal-500 hover:shadow-xl hover:shadow-emerald-500/10 active:scale-95"
		>
			Question Suivante ➜
		</button>
	</div>
</div>
