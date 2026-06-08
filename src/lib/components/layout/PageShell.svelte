<script lang="ts">
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';

	let {
		onHome,
		showLeave = false,
		leaveLabel = 'Quitter',
		children
	}: {
		onHome: () => void;
		showLeave?: boolean;
		leaveLabel?: string;
		children: import('svelte').Snippet;
	} = $props();
</script>

<div class="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6">
	<Header {onHome} {showLeave} {leaveLabel} />
	<main class="flex flex-1 flex-col justify-center py-8">
		{@render children()}
	</main>
	<Footer />
</div>
