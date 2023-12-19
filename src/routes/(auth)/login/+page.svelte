<script lang="ts">
	import { browser } from '$app/environment';
	import { applyAction, enhance } from '$app/forms';
	import { goto, invalidateAll, pushState } from '$app/navigation';
	import { userAuthStore } from '$lib/stores/store';
	import type { ActionResult } from '@sveltejs/kit';
	import { onDestroy, onMount } from 'svelte';
	import OAuthForm from '$lib/components/OAuthForm.svelte';
	import { Github } from 'lucide-svelte';
	import { deleteDeviceFingerprint, setDeviceFingerprint } from '$lib/utils/utils.common';

	const errorMsg: any = {};
	function setErrorMsg() {
		errorMsg['email'] = '';
		errorMsg['password'] = '';
	}

	function enhancedSignin() {
		return async ({ result }: any) => {
			setErrorMsg();
			console.log('Formaction result data', result.data, result);
			if (result.type == 'redirect') {
				await applyAction(result);
				invalidateAll();
				// return goto(result.location);
				window.location.href = result.location ?? '/';
				deleteDeviceFingerprint();
				return;
			} else if (result.type == 'failure') {
				if (!result.data.success) {
					result.data.errors.forEach((error: any) => {
						console.log(error);
						if (error.path == 'email') errorMsg.email = error.message;
						if (error.path == 'password') errorMsg.password = error.message;
					});
				}

				await applyAction(result);
				invalidateAll();
			}
		};
	}

	// async function _openGoogleAuthURL(url: string) {
	// 	// let windowFeatures =
	// 	// 	'width=600,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes';

	// 	window.open(url, '_self');
	// }

	// function subscibeToAuthStore() {
	// 	if (!browser) return;

	// 	userAuthStore.subscribe((value) => {
	// 		if (value.isAuthenticated) {
	// 			console.log('userAuthStore', value);
	// 			// window.location.href = '/';
	// 		}
	// 		// console.log('userAuthStore', value);
	// 		// tempUserData = value;
	// 	});
	// }
	// $: {
	// 	console.log('userAuthStore', $userAuthStore);
	// }

	onMount(() => {
		// TODO: delete this cookie form every other pages
		setDeviceFingerprint();
		// subscibeToAuthStore();
		setErrorMsg();
	});
</script>

<div class="w-full max-w-sm p-6 m-auto mx-auto bg-white rounded-lg shadow-md -dark:bg-gray-800">
	<div class="flex justify-center mx-auto">
		<img class="w-auto h-7 sm:h-8" src="https://merakiui.com/images/logo.svg" alt="" />
	</div>

	<form class="mt-6" method="post" action="?/password" use:enhance={enhancedSignin}>
		<div class=" ">
			<label for="email" class="block text-sm text-gray-800 -dark:text-gray-200">Email</label>
			<input
				name="email"
				type="email"
				class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-lg -dark:bg-gray-800 -dark:text-gray-300 -dark:border-gray-600 focus:border-blue-400 -dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
			/>
			{#if errorMsg.email}
				<div class="p-1 my-1.5 text-red-700">
					{errorMsg.email}
				</div>
			{/if}
		</div>
		<div class="mt-4">
			<div class="flex items-center justify-between">
				<label for="password" class="block text-sm text-gray-800 -dark:text-gray-200"
					>Password</label
				>
				<a href="/forgot-password" class="text-xs text-gray-600 -dark:text-gray-400 hover:underline"
					>Forget Password?</a
				>
			</div>

			<input
				name="password"
				type="password"
				class="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-lg -dark:bg-gray-800 -dark:text-gray-300 -dark:border-gray-600 focus:border-blue-400 -dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
			/>
			{#if errorMsg.password}
				<div class="p-1 my-1.5 text-red-700">
					{errorMsg.password}
				</div>
			{/if}
		</div>

		<div class="mt-6">
			<button
				class="w-full px-6 py-2.5 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50"
			>
				Sign In
			</button>
		</div>
	</form>
	<div class="flex items-center justify-between mt-4">
		<span class="w-2/5 border-b -dark:border-gray-600 lg:w-2/5"></span>

		<div class="text-xs text-center text-gray-500 uppercase -dark:text-gray-400 hover:underline">
			or
		</div>

		<span class="w-2/5 border-b -dark:border-gray-400 lg:w-2/5"></span>
	</div>
	<OAuthForm
		provider="google"
		action="?/google"
		button_class="text-white bg-blue-500 hover:bg-blue-400 focus:bg-blue-400"
	>
		<span slot="icon">
			<svg class="w-4 h-4 mx-2 fill-current" viewBox="0 0 24 24">
				<path
					d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
				>
				</path>
			</svg>
		</span>
	</OAuthForm>
	<OAuthForm
		provider="github"
		action="?/github"
		button_class="text-white bg-[#24292E] hover:bg-[#2b3137]/90 focus:bg-[#2b3137] 	"
	>
		<span slot="icon">
			<Github />
		</span>
	</OAuthForm>

	<p class="mt-8 text-xs font-light text-center text-gray-400">
		Don't have an account? <a
			href="/register"
			class="font-medium text-gray-700 -dark:text-gray-200 hover:underline">Create One</a
		>
	</p>
</div>
