<script lang="ts">
	import type { GameItem } from '$lib/dataset';
	import { shuffle } from '$lib/utils/shuffle';
	import { GAME_CONSTANTS } from '$lib/config/gameConstants';
	import PageShell from '$lib/components/layout/PageShell.svelte';
	import WelcomeScreen from '$lib/components/features/WelcomeScreen.svelte';
	import GameplayScreen from '$lib/components/features/GameplayScreen.svelte';
	import GameOverScreen from '$lib/components/features/GameOverScreen.svelte';

	let { data } = $props();

	type GameStatus = 'welcome' | 'playing' | 'gameover';

	let gameStatus = $state<GameStatus>('welcome');
	let score = $state(0);
	let timeLeft = $state<number>(GAME_CONSTANTS.SOLO_INITIAL_TIME_SECONDS);
	let streak = $state(0);
	let shuffledItems = $state<GameItem[]>([]);
	let currentItemIndex = $state(0);
	let currentItem = $derived<GameItem | undefined>(shuffledItems[currentItemIndex]);
	let answered = $state(false);
	let isCorrect = $state<boolean | null>(null);

	let highScores = $derived(data.highScores);

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

	function startGame() {
		score = 0;
		streak = 0;
		answered = false;
		isCorrect = null;
		shuffledItems = shuffle(data.gameWords);
		currentItemIndex = 0;
		timeLeft = GAME_CONSTANTS.SOLO_INITIAL_TIME_SECONDS;
		gameStatus = 'playing';
	}

	function endGame() {
		gameStatus = 'gameover';
	}

	function submitGuess(guess: 'ikea' | 'city' | 'both') {
		if (answered || !currentItem) return;
		answered = true;
		isCorrect = guess === currentItem.type;

		if (isCorrect) {
			score +=
				guess === 'both' ? GAME_CONSTANTS.SOLO_POINTS_BOTH : GAME_CONSTANTS.SOLO_POINTS_CORRECT;
			streak++;
			timeLeft = Math.min(timeLeft + GAME_CONSTANTS.SOLO_TIME_BONUS_CORRECT, 99);
		} else {
			streak = 0;
			timeLeft = Math.max(timeLeft - GAME_CONSTANTS.SOLO_TIME_PENALTY_WRONG, 0);
			if (timeLeft <= 0) endGame();
		}
	}

	function nextQuestion() {
		answered = false;
		isCorrect = null;
		if (currentItemIndex + 1 < shuffledItems.length) {
			currentItemIndex++;
		} else {
			shuffledItems = shuffle(data.gameWords);
			currentItemIndex = 0;
		}
	}

	function goToMenu() {
		gameStatus = 'welcome';
	}
</script>

<svelte:head>
	<title>Möbelhem</title>
</svelte:head>

<PageShell onHome={goToMenu} showLeave={gameStatus === 'playing'}>
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
</PageShell>
