<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { deleteDeviceFingerprint } from '$lib/utils/utils.common.js';
	import { onMount } from 'svelte';

	export let data;
	let { email, provider } = data as { email: string; provider: string };

	let key = '';
	onMount(() => {
		if ($page.url.searchParams.has('rvkey')) {
			key = encodeURIComponent($page.url.searchParams.get('rvkey') ?? '');
			console.log('rvkey', key);
		}
	});

	let showRedirectMsg = false;

	function enhancedConfirm() {
		return async ({ result }: any) => {
			if (result?.data?.success) {
				setTimeout(() => {
					deleteDeviceFingerprint();
					showRedirectMsg = result?.data?.message;
					window.location.href = '/';
				}, 1000);
			}
			console.log('action result', result);
		};
	}

	function enhancedCancel() {
		return async ({ result }: any) => {
			if (result?.data?.success) {
				deleteDeviceFingerprint();
				showRedirectMsg = result?.data?.message;
				setTimeout(() => {
					window.location.href = '/';
				}, 1000);
			}
			console.log('action result', result);
		};
	}
</script>

<main>
	<h1>Confirm Account</h1>
	<h2>Press `Confirm` button to agree our policies and confirm.</h2>
	<p>
		Email: {email}
		Provider: {provider}
	</p>
</main>
<div class="flex gap-4">
	<form method="post" action="?/confirm&rvkey={key}" use:enhance={enhancedConfirm}>
		<button type="submit" class="btn btn-primary">Confirm</button>
	</form>
	<form method="post" action="?/cancel&rvkey={key}" use:enhance={enhancedCancel}>
		<button type="submit" class="btn btn-error">Cancel</button>
	</form>
</div>
