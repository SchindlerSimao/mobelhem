<script lang="ts">
	import type { ScoreEntry } from '$lib/types';
	import Card from '$lib/components/ui/Card.svelte';
	import TabGroup from '$lib/components/ui/TabGroup.svelte';
	import LeaderboardList from '$lib/components/ui/LeaderboardList.svelte';

	type GameMode = 'time_attack' | 'multiplayer';

	let {
		highScores = []
	}: {
		highScores: ScoreEntry[];
	} = $props();

	let activeTab = $state<GameMode>('time_attack');
	let filtered = $derived(highScores.filter((s) => s.mode === activeTab));

	const tabs = [
		{ id: 'time_attack', label: 'Chrono' },
		{ id: 'multiplayer', label: 'Multi' }
	];
</script>

<Card>
	<div class="mb-4 flex items-center justify-between">
		<h3 class="text-sm font-semibold">Scores</h3>
		<TabGroup {tabs} active={activeTab} onChange={(id) => (activeTab = id as GameMode)} />
	</div>
	<LeaderboardList scores={filtered} />
</Card>
