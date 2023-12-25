<script lang="ts">
	import PreDebug from '$lib/dev/PreDebug.svelte';

	export let data: string;
</script>

<PreDebug {data} />
