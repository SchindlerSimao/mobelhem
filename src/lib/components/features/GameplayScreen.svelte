<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import TimerBar from '$lib/components/ui/TimerBar.svelte';
	import QuestionCard from './QuestionCard.svelte';
	import FeedbackPanel from './FeedbackPanel.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import type { GameItem } from '$lib/dataset';

	let {
		score,
		streak,
		timeLeft,
		currentItem,
		answered,
		isCorrect,
		onGuess,
		onNext
	}: {
		score: number;
		streak: number;
		timeLeft: number;
		currentItem: GameItem;
		answered: boolean;
		isCorrect: boolean | null;
		onGuess: (guess: 'ikea' | 'city' | 'both') => void;
		onNext: () => void;
	} = $props();
</script>

<div class="space-y-4">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<Badge label="Score" value={score} />
			{#if streak >= 3}
				<Badge label="Serie" value={streak} />
			{/if}
		</div>
		<TimerBar {timeLeft} max={60} class="w-48" />
	</div>

	<Card class="flex min-h-[380px] flex-col">
		{#if !answered}
			<QuestionCard item={currentItem} {onGuess} />
		{:else}
			<FeedbackPanel item={currentItem} {isCorrect} {onNext} />
		{/if}
	</Card>
</div>
