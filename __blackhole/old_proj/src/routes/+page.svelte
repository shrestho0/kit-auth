<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';

	const siteRoutes = [
		{ name: 'Home', path: '/' },
		{ name: 'About', path: '/about' },
		{ name: 'Register', path: '/register' },
		{ name: 'Login', path: '/login' },
		{ name: 'Test', path: '/test' }
	];
</script>

<div class="drawer">
	<input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex flex-col">
		<!-- Navbar -->
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
			<div class="flex-1 px-2 mx-2">Navbar Title</div>
			<div class="flex-none hidden lg:block">
				<ul class="menu menu-horizontal">
					<!-- Navbar menu content here -->
					{#each siteRoutes as route}
						<li><a href={route.path}>{route.name}</a></li>
					{/each}
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
				</ul>
			</div>
		</div>
		<!-- Page content here -->
		Content
	</div>
	<div class="drawer-side">
		<label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu p-4 w-80 min-h-full bg-base-200">
			<!-- Sidebar content here -->
			{#each siteRoutes as route}
				<li><a href={route.path}>{route.name}</a></li>
			{/each}
			ss
			<form
				action="/logout"
				method="post"
				use:enhance={() => {
					return async ({ result }) => {
						console.log(result);
						// if (result.type === 'redirect') {
						// 	await applyAction(result);
						// 	invalidateAll();
						// 	goto(result.location);
						// }
						// await applyAction(result);
						// invalidateAll();
					};
				}}
			>
				<li>
					<button class="bg-red-400"> Logout </button>
				</li>
			</form>
		</ul>
	</div>
</div>
