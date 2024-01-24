<script lang="ts">
	import { ModeToggle, MainNav, MobileNav, Logo } from '$components/docs/';
	import { siteConfig } from '$lib/config/site';
	import { cn, md5, parseUserAgent } from '$lib/utils/';
	import { GithubLogo, LinkedinLogo } from 'radix-icons-svelte';
	import * as Avatar from '$ui/avatar';
	import { page } from '$app/stores';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Button from '../ui/button/button.svelte';
	import { Separator } from '../ui/separator';
	import { User } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	let triggerKeyPrefix: 'Alt' | 'Option';

	async function handleLogOut() {
		const res = await fetch('/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		if (res.ok) {
			const json = await res.json();
			if (json?.success) {
				toast.success('Logged out successfully', {
					position: 'top-right',
					class: ' mt-8 mr-4 ',

					duration: 2e3
				});
			}
			invalidateAll();
		}

		//
	}

	function handleMount() {
		triggerKeyPrefix = parseUserAgent(navigator.userAgent)?.os?.includes('Mac') ? 'Option' : 'Alt';
	}

	function keybindingForAuthUser(e: KeyboardEvent) {
		if (!$page.data?.user_id) {
			if (e.key === 'l' && e.altKey) {
				window.location.href = '/login';
			}
			if (e.key === 'r' && e.altKey) {
				window.location.href = '/register';
			}
			return;
		}
		if (e.altKey) {
			//
			if (e.key === 'l' && e.altKey) {
				handleLogOut();
				return;
			}

			if (siteConfig.loggedInUserEventsMap.has(e.key)) {
				window.location.href = siteConfig.loggedInUserEventsMap.get(e.key)?.href as string;
			}
		}
		return;
	}

	onMount(() => {
		handleMount();
		onkeydown = keybindingForAuthUser;
	});
	// onMount(() => {
	// 	if (browser) {
	// 		if (!navigator) return;
	// 		triggerKeyPrefix = parseUserAgent(navigator.userAgent)?.os?.includes('Mac')
	// 			? 'Option'
	// 			: 'Alt';

	// 		// if ($page.data?.user_id) {
	// 		// 	onkeydown = async (e) => {
	// 		// 		if (e.key === 'p' && e.altKey) {
	// 		// 			e.preventDefault();
	// 		// 			console.log('go to profile');
	// 		// 		} else if (e.key === 'l' && e.altKey) {
	// 		// 			const res = await fetch('/logout', {
	// 		// 				method: 'POST',
	// 		// 				headers: {
	// 		// 					'Content-Type': 'application/json'
	// 		// 				}
	// 		// 			});
	// 		// 			if (res.ok) {
	// 		// 				const json = await res.json();
	// 		// 				if (json?.success) {
	// 		// 					toast.success('Logged out successfully');
	// 		// 				}
	// 		// 				invalidateAll();
	// 		// 			}

	// 		// 			console.log('logout');

	// 		// 			return;
	// 		// 		}
	// 		// 	};
	// 		// }
	// 	}
	// });
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="container flex h-14 max-w-screen-2xl items-center">
		<MainNav />
		<MobileNav />
		<!-- <section class="kbd md:flex-1 md:hidden">
			<div class="w-full flex-1">
				<CommandMenu />
			</div>
		</section> -->
		<div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
			<div class="w-full md:hidden">
				<Logo class="flex items-center gap-2 justify-center " />
			</div>

			<nav class=" items-center hidden md:flex">
				<a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
					<div class={cn('w-9 px-0 ')}>
						<GithubLogo class="h-4 w-4" />
						<span class="sr-only">GitHub</span>
					</div>
				</a>
				<a href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer">
					<div class={cn('w-9 px-0 ')}>
						<LinkedinLogo class="h-4 w-4" />
						<span class="sr-only">GitHub</span>
					</div>
				</a>
				<ModeToggle />
			</nav>
		</div>
		<Separator class="hidden md:block mx-2 h-6" orientation="vertical" />
		<div class=" flex justify-center items-center">
			<!-- <CommandMenu /> -->

			<!-- <section class="auth flex items-center justify-center"> -->
			{#if $page.data?.user_id && $page.data?.user_username}
				<!-- {$page.data?.user_emails[0]} -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button builders={[builder]} variant="ghost" class="  md:mr-2 px-0 text-base">
							<Avatar.Root>
								<!-- <Avatar.Image src="https://github.com/shrestho0.png" alt="@" /> -->
								<Avatar.Image
									src={'https://gravatar.com/avatar/' + md5($page.data?.user_emails[0])}
									alt="@"
								/>

								<Avatar.Fallback
									>{$page.data?.user_username?.slice(0, 2)?.toUpperCase()}</Avatar.Fallback
								>
							</Avatar.Root>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56">
						<DropdownMenu.Label
							>hola, {$page.data.user_data.name ?? $page.data.user_username}!</DropdownMenu.Label
						>
						<DropdownMenu.Separator />
						<DropdownMenu.Group>
							{#each siteConfig.loggedInUserEventsMap.values() as item, index (item + index.toString())}
								<a href={item.href}>
									<DropdownMenu.Item>
										{item.title}
										<DropdownMenu.Shortcut class="hidden md:block"
											>{`${triggerKeyPrefix} + ${item.shortcutKey}`}</DropdownMenu.Shortcut
										>
									</DropdownMenu.Item>
								</a>
							{/each}
						</DropdownMenu.Group>
						<DropdownMenu.Separator />
						<DropdownMenu.Group
							><DropdownMenu.Item>
								<Button on:click={handleLogOut} class="w-full">Logout</Button>
							</DropdownMenu.Item></DropdownMenu.Group
						>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<div class="auth_buttons hidden md:block gap-2">
					<a href="/login">
						<Button>Login</Button>
					</a>
					<a href="/register">
						<Button variant="outline">Register</Button>
					</a>
				</div>

				<div class="md:hidden">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button builders={[builder]} variant="outline">
								<User class="h-5 w-5" />
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Group>
								<a href="/login">
									<DropdownMenu.Item>Login</DropdownMenu.Item>
								</a>
								<a href="/register">
									<DropdownMenu.Item>Register</DropdownMenu.Item>
								</a>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			{/if}
			<!-- </section> -->
		</div>
	</div>
</header>
