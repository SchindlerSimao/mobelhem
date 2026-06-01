<script lang="ts">
	import { scale } from 'svelte/transition';
	import type { GameItem } from '$lib/dataset';
	import Badge from '../ui/Badge.svelte';
	import QuestionCard from './QuestionCard.svelte';
	import FeedbackPanel from './FeedbackPanel.svelte';

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

<div class="mx-auto w-full max-w-4xl space-y-6" in:scale={{ duration: 250, start: 0.95 }}>
	<!-- Top Game Info Bar -->
	<div
		class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/30 px-6 py-4 shadow-lg backdrop-blur-sm"
	>
		<Badge label="Score" value={score} color="emerald" />

		{#if streak >= 3}
			<Badge label="Série" value={`${streak} d'affilée !`} color="indigo" animate={true} />
		{/if}

		<div class="flex max-w-xs flex-grow items-center gap-3">
			<span class="text-xs font-bold tracking-widest text-slate-400 uppercase">Chrono:</span>
			<div
				class="relative h-3 flex-grow overflow-hidden rounded-full border border-slate-800/50 bg-slate-950"
			>
				<div
					class="h-full rounded-full transition-all duration-1000
							{timeLeft > 30 ? 'bg-gradient-to-r from-emerald-500 to-sky-500' : ''}
							{timeLeft <= 30 && timeLeft > 10 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : ''}
							{timeLeft <= 10 ? 'animate-pulse bg-red-500' : ''}
						"
					style="width: {(timeLeft / 60) * 100}%"
				></div>
			</div>
			<span
				class="font-display text-sm font-bold {timeLeft <= 10
					? 'animate-bounce text-red-400'
					: 'text-slate-200'}"
			>
				{timeLeft}s
			</span>
		</div>
	</div>

	<!-- Game Card -->
	<div
		class="relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 lg:p-8"
	>
		<div
			class="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 opacity-20 blur-[100px]"
		></div>

		{#if !answered}
			<QuestionCard item={currentItem} {onGuess} />
		{:else}
			<FeedbackPanel item={currentItem} {isCorrect} {onNext} />
		{/if}
	</div>
</div>
