<script lang="ts">
	//@ts-ignore
	import getBrowserFingerprint from 'get-browser-fingerprint';
	import { onMount } from 'svelte';
	// const fingerprint = getBrowserFingerprint();
	// console.log(fingerprint);
	onMount(() => {
		console.log('mounted');
		const fingerprint = getBrowserFingerprint();
		console.log(fingerprint);
	});
</script>
