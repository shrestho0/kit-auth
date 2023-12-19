<script lang="ts">
	// import { browser } from '$app/environment';
	// import { userAuthStore } from '$lib/stores/store.js';

	// export let data;
	// $: {
	// 	if (browser) console.log('Layout data', data);
	// 	if (browser) console.log('User auth store', $userAuthStore);
	// }
</script>

<main class="w-full flex flex-col h-screen bg-red-200">
	<slot />
</main>
