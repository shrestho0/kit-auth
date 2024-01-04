<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	import { AUTH_RESPONSES } from '$lib/auth/enums';
	import PreDebug from '$lib/dev/PreDebug.svelte';
	import { onMount } from 'svelte';

	export let data: any = {};
	console.log('data', data);

	let action = '';
	onMount(() => {
		if (data.OAUTH_CALLBACK_RESPONSE == AUTH_RESPONSES.SUCCESS_REDIRECT) {
			action = 'success redirect';
		}
	});

	let confirmed: any;

	let canceled: any;

	let redirectMessage: string;
	let showRedirectMessage: boolean = false;

	function enhancedConfirm() {
		return async ({ result }: any) => {
			canceled = result;
			if (result.data.success) {
				redirectMessage = result.data.message;
				showRedirectMessage = true;
				setTimeout(() => {
					document.location.href = result.data.location;
				}, 1000);
			}

			// await applyAction(result);
			// invalidateAll();
		};
	}

	function enhancedCancel() {
		return async ({ result }: any) => {
			canceled = result;
			if (result.data.success) {
				redirectMessage = result.data.message;
				showRedirectMessage = true;
				setTimeout(() => {
					document.location.href = result.data.location;
				}, 1000);
			}

			// await applyAction(result);
			// invalidateAll();
		};
	}
</script>

{#if showRedirectMessage}
	<div class="alert">
		<progress class="progress w-12"></progress>

		<h2>
			{redirectMessage}
		</h2>
	</div>
{/if}

{#if confirmed}
	<PreDebug data={confirmed} title="Confirmed" />
{/if}

{#if canceled}
	<PreDebug data={canceled} title="Canceled" />
{/if}

<PreDebug {data} />

<form
	action="?/cancel&rvkey={encodeURIComponent($page.url.searchParams.get('rvkey') ?? '')}"
	method="post"
	use:enhance={enhancedCancel}
>
	<button type="submit">Cancel</button>
</form>

<form
	action="?/confirm&rvkey={encodeURIComponent($page.url.searchParams.get('rvkey') ?? '')}"
	method="post"
	use:enhance={enhancedConfirm}
>
	<button type="submit">Confirm</button>
</form>
