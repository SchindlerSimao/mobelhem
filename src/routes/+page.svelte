<script lang="ts">
	import { dataset, shuffle, type GameItem } from '$lib/dataset';

	import WelcomeScreen from '$lib/components/features/WelcomeScreen.svelte';
	import GameplayScreen from '$lib/components/features/GameplayScreen.svelte';
	import GameOverScreen from '$lib/components/features/GameOverScreen.svelte';

	// Props from +page.server.ts
	let { data } = $props();

	// Types definition
	type GameStatus = 'welcome' | 'playing' | 'gameover';

	// Game States
	let gameStatus = $state<GameStatus>('welcome');
	let score = $state(0);
	let timeLeft = $state(60);
	let streak = $state(0);

	let shuffledItems = $state<GameItem[]>([]);
	let currentItemIndex = $state(0);
	let currentItem = $derived<GameItem | undefined>(shuffledItems[currentItemIndex]);

	// Play round states
	let answered = $state(false);
	let isCorrect = $state<boolean | null>(null);

	// High scores bound state
	interface ScoreEntry {
		id: string;
		username: string;
		score: number;
		mode: string;
		createdAt: string;
	}

	// eslint-disable-next-line svelte/prefer-writable-derived
	let highScores = $state<ScoreEntry[]>([]);
	$effect(() => {
		highScores = data.highScores;
	});

	// Reactive timer for Time Attack mode using Svelte 5 effects
	$effect(() => {
		if (gameStatus === 'playing' && !answered) {
			const interval = setInterval(() => {
				timeLeft--;
				if (timeLeft <= 0) {
					timeLeft = 0;
					endGame();
				}
			}, 1000);
			return () => clearInterval(interval);
		}
	});

	// Start game
	function startGame() {
		score = 0;
		streak = 0;
		answered = false;
		isCorrect = null;
		shuffledItems = shuffle(dataset);
		currentItemIndex = 0;
		timeLeft = 60;
		gameStatus = 'playing';
	}

	// End game
	function endGame() {
		gameStatus = 'gameover';
	}

	// Submit guess
	function submitGuess(guess: 'ikea' | 'city' | 'both') {
		if (answered || !currentItem) return;

		answered = true;
		isCorrect = guess === currentItem.type;

		if (isCorrect) {
			score += guess === 'both' ? 150 : 100;
			streak++;
			timeLeft = Math.min(timeLeft + 2, 99);
		} else {
			streak = 0;
			timeLeft = Math.max(timeLeft - 5, 0);
			if (timeLeft <= 0) endGame();
		}
	}

	// Next Question
	function nextQuestion() {
		answered = false;
		isCorrect = null;

		if (currentItemIndex + 1 < shuffledItems.length) {
			currentItemIndex++;
		} else {
			shuffledItems = shuffle(dataset);
			currentItemIndex = 0;
		}
	}

	// Go to Menu
	function goToMenu() {
		gameStatus = 'welcome';
	}
</script>

<div class="mx-auto flex min-h-[90vh] max-w-6xl flex-col justify-between px-4 py-8">
	<!-- Header / Navbar -->
	<header class="mb-6 flex items-center justify-between border-b border-slate-800/80 pb-6">
		<button
			onclick={goToMenu}
			class="group flex cursor-pointer items-center gap-3 border-none bg-transparent focus:outline-none"
		>
			<span class="text-3xl">🇸🇨</span>
			<h1
				class="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text font-display text-2xl font-bold tracking-wider text-transparent transition-opacity group-hover:opacity-80"
			>
				MÖBELHEM
			</h1>
		</button>

		<div class="flex items-center gap-4">
			{#if gameStatus === 'playing'}
				<button
					id="quit-game"
					onclick={goToMenu}
					class="cursor-pointer rounded-xl border border-red-800/40 bg-red-950/40 px-4 py-2 text-sm font-medium text-red-300 shadow-md transition-all hover:bg-red-900/60"
				>
					Quitter
				</button>
			{/if}
		</div>
	</header>

	<main class="flex flex-grow flex-col justify-center">
		{#if gameStatus === 'welcome'}
			<WelcomeScreen {highScores} onStartGame={startGame} />
		{:else if gameStatus === 'playing' && currentItem}
			<GameplayScreen
				{score}
				{streak}
				{timeLeft}
				{currentItem}
				{answered}
				{isCorrect}
				onGuess={submitGuess}
				onNext={nextQuestion}
			/>
		{:else if gameStatus === 'gameover'}
			<GameOverScreen {score} bind:highScores onReplay={startGame} onMenu={goToMenu} />
		{/if}
	</main>

	<!-- Footer -->
	<footer class="text-slate-650 mt-6 border-t border-slate-900 pt-6 text-center text-xs">
		<p>
			© 2026 Möbelhem - Fabriqué avec amour pour le design nordique. Les logos et noms de marque
			IKEA sont déposés par Inter IKEA Systems B.V.
		</p>
	</footer>
</div>
