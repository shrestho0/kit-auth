<script lang="ts">
	import PreDebug from '$lib/dev/PreDebug.svelte';

	import { page } from '$app/stores';
	import { error } from '@sveltejs/kit';
</script>

{$page.status}
{$page.error?.message}

<PreDebug title="Page Data" data={$page} />
