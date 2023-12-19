<script lang="ts">
	import PreDebug from '$lib/dev/PreDebug.svelte';
	import { onMount } from 'svelte';
	import './app.css';
	import { browser } from '$app/environment';
	import { userAuthStore } from '$lib/stores/store.js';

	export let data;
	// $: {
	// 	if (browser) console.log('Layout data', data);
	// 	if (browser) console.log('User auth store', $userAuthStore);
	// }
	function refreshTokensInverval() {
		let interval = setInterval(async () => {
			console.log('refreshing tokens');
			const now = new Date().toISOString();
			document.cookie = `refresh_token=${now}; expires=${now + 1000}; path=/;`;
		}, 10000);

		return () => clearInterval(interval);
	}
	onMount(refreshTokensInverval);
</script>

<slot />

<PreDebug {data} />
