<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	export let data: Object = {};
	export let title: String = 'PreDebug';

	onMount(() => {
		if (!browser) {
			console.log('PreDebug: not in browser');
			return;
		}
	});
</script>

<div class="m-2 p-2 border-2 border-black">
	<h2 class="title">Debug: {title}</h2>
	<pre>
{JSON.stringify(data, null, 2)}
    </pre>
</div>
