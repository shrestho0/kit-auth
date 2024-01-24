<script lang="ts">
	import { ModeToggle, MainNav, MobileNav, Logo } from '$components/docs/';
	import { siteConfig } from '$lib/config/site';
	import { cn, md5 } from '$lib/utils/';
	import { GithubLogo, LinkedinLogo } from 'radix-icons-svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { page } from '$app/stores';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Menu } from 'lucide-svelte';
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<div class="container flex h-14 max-w-screen-2xl items-center">
		<MainNav />
		<MobileNav />

		<div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
			<!-- <div class="w-full flex-1 md:w-auto md:flex-none">//</div> -->
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

		<section class="px-2">
			{#if $page.data?.user_id && $page.data?.user_username}
				<!-- {$page.data?.user_emails[0]} -->
				<DropdownMenu.Root>
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
				</DropdownMenu.Root>
			{:else}
				Login koro
			{/if}
		</section>
	</div>
</header>
