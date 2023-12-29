<script lang="ts">
	import PreDebug from '$lib/dev/PreDebug.svelte';
	export let data: any = {};
</script>

<!-- <script lang="ts">
	import { browser } from '$app/environment';
	import PreDebug from '$lib/dev/PreDebug.svelte';
	import { onMount } from 'svelte';

	export let data: any;
	let post_auth_status: OAUTH_CALLBACK_RESPONSE_STATUS | undefined;
	let post_auth_type: OAUTH_CALLBACK_RESPONSE_STATUS_TYPE | undefined;
	PreDebug;
	// let loading = true;
	onMount(() => {
		// loading = false;
		post_auth_status = data?.status;
		post_auth_type = data?.type;
		if (data?.status === 'REDIRECT') {
			console.log('OAuth Callback data', data);
			if (browser) {
				console.log('OAuth Callback data', data);
				// userAuthStore.set({
				// 	isAuthenticated: true,
				// 	user_id: data?.user?.id ?? '',
				// 	user_username: data?.user?.username ?? ''
				// });
				// check if user has token
				console.log(document.cookie);
				let timeout = setTimeout(() => {
					window.location.href = data?.location ?? '/';
				}, 1000);
				return () => timeout && clearTimeout(timeout);
				// window.close();
			}
			// return goto(data?.location);
		}
	});
</script>

<div class="hero w-full h-auto bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<progress class="progress w-12"></progress>
			{#if post_auth_status === 'REDIRECT'}
				{#if post_auth_type === 'REGISTER'}
					REDIRECTING TO CONFIRM ACCOUNT PAGE...
				{:else if post_auth_type === 'LOGIN'}
					LOGGED_IN_SUCCESSFULLY \n REDIRECTING...
				{/if}
			{/if}
		</div>
	</div>
</div>
-->

<PreDebug {data} title="Oauth-callback data" />
