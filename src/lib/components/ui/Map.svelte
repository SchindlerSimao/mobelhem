<script lang="ts">
	import type { GameItem } from '$lib/types';

	let { lat, lng, name, desc }: {
		lat: number;
		lng: number;
		name: string;
		desc?: string;
	} = $props();

	function initMap(node: HTMLElement) {
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

		const icon = L.divIcon({
			className: '',
			html: `<div style="width:10px;height:10px;border-radius:50%;background:#e5e5e5;border:2px solid #0a0a0a;"></div>`,
			iconSize: [14, 14],
			iconAnchor: [7, 7]
		});

		const marker = L.marker([lat, lng], { icon }).addTo(map);
		marker
			.bindPopup(`<b>${name}</b><br><span style="font-size:11px">${desc || ''}</span>`)
			.openPopup();

		setTimeout(() => {
			map.invalidateSize();
			map.flyTo([lat, lng], 6, { duration: 1.5, easeLinearity: 0.25 });
		}, 300);

		return { destroy: () => map.remove() };
	}
</script>

<div class="relative flex h-[200px] overflow-hidden rounded-md border border-border bg-bg">
	<div class="h-full w-full" use:initMap></div>
</div>
