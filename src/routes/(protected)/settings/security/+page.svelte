<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	export let data: any;

	import OAuthForm from '$lib/components/OAuthForm.svelte';
	import PreDebug from '$lib/dev/PreDebug.svelte';
	import type { OauthCredentials, UserDevice } from '@prisma/client';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	let loading = true;
	let userAuthProviders: OauthCredentials[] = [];
	let userDevices: UserDevice[] = [];
	let hasSetPassword: boolean = false;
	let showSetPasswordFields = false;

	function setUserOauthProviders() {
		if (!data?.UserOauthProviders) return;

		userAuthProviders = data.UserOauthProviders;

		if (userAuthProviders.find((provider) => provider.provider === 'password')) {
			hasSetPassword = true;
		}
	}
	function setUserDevices() {
		if (!data?.UserDevices) return;

		userDevices = data.UserDevices;
	}

	onMount(handlePageMount);
	function handlePageMount() {
		setUserOauthProviders();
		setUserDevices();

		setTimeout(() => {
			loading = false;
		}, 500);
		// loading = false;
	}
</script>

{#if loading}
	<div class="flex justify-center items-center">
		<div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
	</div>
{:else}
	<h2 class="text-2xl font-bold">Security Settings</h2>

	<h2 class="text-xl font-semibold">Authentication Methods:</h2>
	{#if !hasSetPassword}
		<button
			on:click={() => {
				showSetPasswordFields = !showSetPasswordFields;
			}}
		>
			Set Password
		</button>
		{#if showSetPasswordFields}
			<form
				action="?/add_oauth"
				method="post"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							hasSetPassword = true;
							showSetPasswordFields = false;
							toast.success('Password Set');
						} else if (result.type === 'failure') {
							toast.error(result?.data?.errors?.message ?? "Couldn't set password");
						}
						console.log(result);

						await applyAction(result);
						invalidateAll();
					};
				}}
			>
				<input type="hidden" name="email" value={userAuthProviders[0].providerEmail} />
				<input type="password" name="password" placeholder="Password" />
				<input type="password" name="passwordConfirm" placeholder="Confirm Password" />
				<button type="submit">Set</button>
			</form>
		{/if}
		<!-- <OAuthForm action="" /> -->
	{/if}

	<PreDebug data={data?.UserOauthProviders} title="Auth Methods" />

	<PreDebug data={data?.UserDevices} title="User Auth Devices" />
{/if}
