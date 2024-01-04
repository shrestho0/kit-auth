<script lang="ts">
	import PreDebug from '$lib/dev/PreDebug.svelte';
	import './app.css';
	export let data: any;
</script>

<slot />
<PreDebug {data} title="SideWide Data" />
