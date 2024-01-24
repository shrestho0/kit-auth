<script lang="ts">
	import { page } from '$app/stores';
	import { siteConfig } from '$lib/config/site';
	import { cn } from '$lib/utils/';
	import Logo from './logo.svelte';
</script>

<div class="mr-4 hidden md:flex">
	<a href="/" class="mr-6 flex items-center space-x-2">
		<Logo class="flex items-center gap-2 justify-center " />
	</a>
	<nav class="flex items-center gap-6 text-sm">
		{#if siteConfig?.mainNav?.length}
			{#each siteConfig.mainNav as item, key (key)}
				<a
					href={item.href}
					class={cn(
						'transition-colors hover:text-foreground/80',
						$page.url.pathname === item.href ? 'text-foreground' : 'text-foreground/60'
					)}
				>
					{item.title}
				</a>
			{/each}
		{/if}
	</nav>
</div>
