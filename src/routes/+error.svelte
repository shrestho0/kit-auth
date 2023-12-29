<script lang="ts">
	import PreDebug from '$lib/dev/PreDebug.svelte';
	import { page } from '$app/stores';
	export let data: any = {};
</script>

<h1>Error: {$page.status}</h1>

{#if $page.status === 404}
	<p>Page not found</p>
{:else if $page.status === 500}
	{#if $page.error}
		<PreDebug data={$page.error} />
	{/if}
	<p>Internal server error</p>
{:else if $page.status === 418}
	<h1>$page.status</h1>
	<h4>{$page.error?.message}</h4>
	<p>Not implemented in this case.</p>
{:else}
	<h1>Error {$page.status}</h1>
	<p>An error occurred</p>
{/if}

<PreDebug title="Error Debug Data" {data} />
