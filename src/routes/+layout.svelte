<script lang="ts">
	import PreDebug from '$lib/dev/PreDebug.svelte';
	import { onMount } from 'svelte';
	import './app.css';
	import { browser } from '$app/environment';

	export let data;

	// function refreshTokensInverval() {
	// 	let interval = setInterval(async () => {
	// 		console.log('refreshing tokens');
	// 		const now = new Date().toISOString();
	// 		document.cookie = `refresh_token=${now}; expires=${now + 1000}; path=/;`;
	// 	}, 5000);

	// 	return () => clearInterval(interval);
	// }
	// onMount(refreshTokensInverval);
</script>

<slot />

<PreDebug {data} />
{#if browser}
	<PreDebug title="cookies" data={document.cookie} />
{/if}
