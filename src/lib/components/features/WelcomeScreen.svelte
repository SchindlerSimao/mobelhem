<script lang="ts">
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import Leaderboard from './Leaderboard.svelte';

	interface ScoreEntry {
		id: string;
		username: string;
		score: number;
		mode: string;
		createdAt: string;
	}

	let {
		highScores = [],
		onStartGame
	}: {
		highScores: ScoreEntry[];
		onStartGame: () => void;
	} = $props();

	// Tabs selector
	let activeTab = $state<'solo' | 'multi'>('solo');

	// Multiplayer form inputs
	let username = $state('');
	let roomCode = $state('');

	function handleCreateRoom(e: Event) {
		e.preventDefault();
		if (!username.trim()) return;
		goto(`/room/NEW?username=${encodeURIComponent(username.trim())}`);
	}

	function handleJoinRoom(e: Event) {
		e.preventDefault();
		if (!username.trim() || !roomCode.trim()) return;
		goto(`/room/${roomCode.trim().toUpperCase()}?username=${encodeURIComponent(username.trim())}`);
	}
</script>

<div in:fade={{ duration: 300 }} class="my-auto grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
	<!-- Left Column: Presentation & Mode Selection -->
	<div class="space-y-6 lg:col-span-7">
		<div class="space-y-3">
			<h2
				class="animate-fade-in font-display text-4xl leading-tight font-extrabold tracking-tight lg:text-5xl"
			>
				Est-ce une <span class="text-sky-400">ville nordique</span> ou un
				<span class="text-amber-400">meuble IKEA</span> ?
			</h2>
			<p class="max-w-xl text-base leading-relaxed text-slate-400">
				Bienvenue dans <b>Möbelhem</b>, le défi linguistique scandinave ultime. Saurez-vous
				démasquer les pièges de la nomenclature d'IKEA ?
			</p>
		</div>

		<!-- Game Type Tabs Toggle -->
		<div class="flex w-fit rounded-2xl border border-slate-800/80 bg-slate-900/40 p-1">
			<button
				onclick={() => (activeTab = 'solo')}
				class="cursor-pointer rounded-xl px-6 py-2.5 text-sm font-bold transition-all {activeTab ===
				'solo'
					? 'border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 text-emerald-400'
					: 'border border-transparent text-slate-400'}"
			>
				👤 Mode Solo
			</button>
			<button
				onclick={() => (activeTab = 'multi')}
				class="cursor-pointer rounded-xl px-6 py-2.5 text-sm font-bold transition-all {activeTab ===
				'multi'
					? 'border border-sky-500/30 bg-gradient-to-r from-sky-500/20 to-blue-600/20 text-sky-400'
					: 'border border-transparent text-slate-400'}"
			>
				👥 Mode Multijoueur
			</button>
		</div>

		<!-- Game Modes content switcher -->
		{#if activeTab === 'solo'}
			<div class="space-y-4 pt-2" in:fade={{ duration: 150 }}>
				<h3 class="text-xs font-bold tracking-widest text-slate-500 uppercase">Mode de Jeu Solo</h3>
				<div class="max-w-md">
					<!-- Time Attack Card (Solo against the clock) -->
					<button
						id="mode-time-attack"
						onclick={() => onStartGame()}
						class="group flex w-full cursor-pointer flex-col rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 text-left shadow-xl transition-all hover:-translate-y-1 hover:border-sky-500/50"
					>
						<span class="mb-3 text-3xl">⚡</span>
						<span
							class="text-base font-bold text-slate-200 transition-colors group-hover:text-sky-400"
							>Contre la Montre</span
						>
						<span class="mt-2 text-xs leading-relaxed text-slate-400">
							60 secondes. +2s par bonne réponse, -5s par erreur. Essayez de réaliser le meilleur
							score possible avant la fin du chrono !
						</span>
					</button>
				</div>
			</div>
		{:else}
			<div
				class="max-w-xl space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/30 p-6"
				in:fade={{ duration: 150 }}
			>
				<div class="space-y-2">
					<h3 class="text-lg font-bold text-slate-200">Salon en Ligne en Temps Réel</h3>
					<p class="text-xs leading-relaxed text-slate-400">
						Jouez à plusieurs en simultané. À chaque manche, devinez le plus vite possible si le mot
						est un meuble IKEA ou une Ville scandinave !
					</p>
				</div>

				<div class="space-y-4">
					<!-- Pseudo field -->
					<div class="space-y-2">
						<label
							for="multi-pseudo"
							class="block font-display text-xs font-bold tracking-wider text-slate-400 uppercase"
							>1. Saisir votre pseudonyme</label
						>
						<input
							id="multi-pseudo"
							type="text"
							bind:value={username}
							placeholder="Pseudo..."
							maxlength="12"
							class="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-200 transition-colors focus:border-sky-500 focus:outline-none"
						/>
					</div>

					<div class="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
						<!-- Create game box -->
						<div
							class="border-slate-850 flex flex-col justify-between space-y-4 rounded-2xl border bg-slate-950/40 p-4"
						>
							<div>
								<h4 class="text-sm font-bold text-slate-200">Nouveau salon</h4>
								<p class="mt-1 text-[11px] text-slate-500">
									Créez une partie et invitez vos amis par code ou URL.
								</p>
							</div>
							<button
								onclick={handleCreateRoom}
								disabled={!username.trim()}
								class="w-full cursor-pointer rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-2.5 text-xs font-extrabold tracking-wider text-slate-950 transition-colors hover:from-sky-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
							>
								Créer un Salon
							</button>
						</div>

						<!-- Join game box -->
						<div
							class="border-slate-850 flex flex-col justify-between space-y-4 rounded-2xl border bg-slate-950/40 p-4"
						>
							<div class="space-y-2">
								<h4 class="text-sm font-bold text-slate-200">Rejoindre par code</h4>
								<input
									type="text"
									bind:value={roomCode}
									placeholder="Code (ex: ABCD)..."
									maxlength="4"
									class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-center font-bold tracking-widest text-slate-200 uppercase transition-colors focus:border-sky-500 focus:outline-none"
								/>
							</div>
							<button
								onclick={handleJoinRoom}
								disabled={!username.trim() || roomCode.trim().length !== 4}
								class="bg-slate-850 w-full cursor-pointer rounded-xl border border-slate-800 py-2.5 text-xs font-bold tracking-wider text-slate-200 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
							>
								Rejoindre
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Right Column: Leaderboards -->
	<div class="lg:col-span-5">
		<Leaderboard {highScores} />
	</div>
</div>
