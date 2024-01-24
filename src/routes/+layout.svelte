<script lang="ts">
	import '$ui/app.css';
	import { applyAction, enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	export let data;

	const siteRoutes: {
		name: string;
		path: string;
	}[] = [
		{ name: 'Home', path: '/' },
		{ name: 'About', path: '/about' },
		{ name: 'Test', path: '/test' }
	];

	const loggedInPages = [
		{ name: 'Profile', path: '/profile' },
		{ name: 'Settings', path: '/settings' }
	];

	import { Toaster } from 'svelte-sonner';
	import Header from '$lib/components/docs/header.svelte';
	import PreDebug from '$lib/dev/PreDebug.svelte';

	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { ModeWatcher } from 'mode-watcher';

	// progress bar value
	const p = tweened(0, {
		duration: 200,
		easing: cubicOut
	});

	let isVisible = false;

	function increase() {
		if ($p >= 0 && $p < 0.2) {
			p.update((_) => _ + 0.04);
		} else if ($p >= 0.2 && $p < 0.5) {
			p.update((_) => _ + 0.02);
		} else if ($p >= 0.5 && $p < 0.8) {
			p.update((_) => _ + 0.002);
		} else if ($p >= 0.8 && $p < 0.99) {
			p.update((_) => _ + 0.0005);
		} else {
			p.set(0);
		}

		if ($navigating) {
			const rand = Math.round(Math.random() * (300 - 50)) + 50;
			setTimeout(function () {
				increase();
			}, rand);
		}
	}

	$: {
		if ($navigating) {
			increase();
			isVisible = true;
		}
		if (!$navigating) {
			p.update((_) => _ + 0.3);
			setTimeout(function () {
				p.set(1);
				setTimeout(function () {
					isVisible = false;
					p.set(0);
				}, 100);
			}, 100);
		}
	}
</script>

{#if $p > 0 && $p < 1 && isVisible}
	<progress value={$p} transition:fade={{ duration: 300 }} />
{/if}
<!-- 
<div class="drawer">
	<input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<div class="w-full navbar bg-base-300">
			<div class="flex-none lg:hidden">
				<label for="my-drawer-3" aria-label="open sidebar" class="btn btn-square btn-ghost">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="inline-block w-6 h-6 stroke-current"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						></path></svg
					>
				</label>
			</div>
			<div class="flex-1 px-2 mx-2"><a href="/"> KitAuth</a></div>
			<div class="flex-none hidden lg:block">
				<ul class="menu menu-horizontal">
					{#each siteRoutes as route}
						<li><a href={route.path}>{route.name}</a></li>
					{/each}
					{#if data?.user_id && data?.user_username}
						{#each loggedInPages as route}<li><a href={route.path}>{route.name}</a></li>{/each}

						<form
							action="/logout"
							method="post"
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'redirect') {
										await applyAction(result);
										invalidateAll();
										// goto(result.location);
										window.location.href = result.location;
									}
								};
							}}
						>
							<li>
								<button> Logout </button>
							</li>
						</form>
					{:else}
						<li><a href="/login">Login</a></li>
						<li><a href="/register">Register</a></li>
					{/if}
				</ul>
			</div>
		</div>
		<slot />
	</div>
	<div class="drawer-side">
		<label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu p-4 w-80 min-h-full bg-base-200">
			{#each siteRoutes as route}
				<li><a href={route.path}>{route.name}</a></li>
			{/each}
			{#if data?.user_id && data?.user_username}
				{#each loggedInPages as route}<li><a href={route.path}>{route.name}</a></li>{/each}

				<form
					action="/logout"
					method="post"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'redirect') {
								await applyAction(result);
								invalidateAll();
								window.location.href = result.location;
							}
						};
					}}
				>
					<li>
						<button> Logout </button>
					</li>
				</form>
			{:else}
				<li><a href="/login">Login</a></li>
				<li><a href="/register">Register</a></li>
			{/if}
		</ul>
	</div>
</div> -->
<Header />
<slot />
<PreDebug {data} />
<Toaster />
<ModeWatcher />

<style>
	progress {
		--bar-color: rgba(255, 255, 255, 0.3);
		--val-color: rgb(26, 5, 77);
		position: fixed;
		top: 0;
		z-index: 99999;
		left: 0;
		height: 4px;
		width: 100vw;
		border-radius: 0;
	}
	/* bar: */
	progress::-webkit-progress-bar {
		background-color: var(--bar-color);
		width: 100%;
	}
	progress {
		background-color: var(--bar-color);
	}

	/* value: */
	progress::-webkit-progress-value {
		background-color: var(--val-color) !important;
	}
	progress::-moz-progress-bar {
		background-color: var(--val-color) !important;
	}
	progress {
		color: var(--val-color);
	}
</style>
