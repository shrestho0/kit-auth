<script lang="ts">
	import * as Sheet from '$ui/sheet';
    import {Button} from '$ui/button';
    import {siteConfig} from '$lib/config/site';
	import {Logo, MobileLink} from "$components/docs";
    let open = false;
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="ghost"
			class="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
		>
			<!-- <Icons.Hamburger class="h-5 w-5" /> -->

<svg
stroke-width="1.5"
viewBox="0 0 24 24"
fill="none"
xmlns="http://www.w3.org/2000/svg"
class="h-5 w-5"
>
<path
    d="M3 5H11"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
/>
<path
    d="M3 12H16"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
/>
<path
    d="M3 19H21"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
/>
</svg>
			<span class="sr-only">Toggle Menu</span>
		</Button>
	</Sheet.Trigger>
	<Sheet.Content side="left" class="pr-0">
		<MobileLink href="/" class="flex items-center" bind:open>
            <Logo class="flex items-center gap-2 justify-center " />
			<!-- <Icons.logo class="mr-2 h-4 w-4" /> -->
			<!-- <span class="font-bold">{siteConfig.name}</span> -->
		</MobileLink>
		<div class="my-4 h-[calc(100vh-8rem)] pb-10 pl-6 overflow-auto">
			<div class="flex flex-col space-y-3">
				{#each siteConfig.mainNav as navItem, index (navItem + index.toString())}
					{#if navItem.href}
						<MobileLink href={navItem.href} bind:open class="text-foreground">
							{navItem.title}
						</MobileLink>
					{/if}
				{/each}
			</div>
			<div class="flex flex-col space-y-2">
				{#each siteConfig.sidebarNav as navItem, index (index)}
					<div class="flex flex-col space-y-3 pt-6">
						<h4 class="font-medium">{navItem.title}</h4>
						{#if navItem?.items?.length}
							{#each navItem.items as item}
								{#if !item.disabled && item.href}
									<MobileLink href={item.href} bind:open>
										{item.title}
										{#if item.label}
											<span
												class="ml-2 rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs leading-none text-[#000000] no-underline group-hover:no-underline"
											>
												{item.label}
											</span>
										{/if}
									</MobileLink>
								{/if}
							{/each}
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</Sheet.Content>
</Sheet.Root>
