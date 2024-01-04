<script lang="ts">
	import { browser } from '$app/environment';
	import { AUTH_RESPONSES } from '$lib/auth/enums.js';
	import PreDebug from '$lib/dev/PreDebug.svelte';
	import { error } from '@sveltejs/kit';
	import { onMount } from 'svelte';
	export let data: {
		OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES;
		message?: string;
		location?: string;

		user_id?: string;
		user_username?: string;
	};

	let loading = true;

	let dataToShow = {
		success: false,
		error: false,
		message: ''
	};

	function setPageError(msg: string) {
		//
		dataToShow.error = true;
		dataToShow.message = msg;
	}
	function redirectPage(location: string) {
		dataToShow.success = true;
		dataToShow.message = 'Redirecting...';
		setTimeout(() => {
			window.location.href = location;
		}, 1000);
	}

	function handlePageMount() {
		if (!browser) return;

		switch (data?.OAUTH_CALLBACK_RESPONSE) {
			case AUTH_RESPONSES.SHOW_ERROR:
				setPageError(data?.message ?? "Some error occured. Couldn't login.");
				break;
			case AUTH_RESPONSES.SUCCESS_REDIRECT:
				redirectPage(data?.location ?? '/login');
				break;
			default:
				break;
		}
		loading = false;
	}

	onMount(handlePageMount);
</script>

<PreDebug {data} title="Oauth-callback data" />

<section class="w-full h-screen flex items-center justify-center">
	{#if !loading}
		<div class="card w-96 glass">
			<!-- <figure>
			<img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="car!" />
		</figure> -->
			<div class="card-body">
				<h2 class="card-title">{dataToShow.message}</h2>
				<!-- <p>How to park your car at your garage?</p> -->
				<!-- <div class="card-actions justify-end">
				<button class="btn btn-primary">Learn now!</button>
			</div> -->
			</div>
		</div>
	{/if}
</section>
