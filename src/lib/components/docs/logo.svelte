<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { siteConfig } from '$lib/config/site';
	type $$Props = HTMLAttributes<HTMLElement>;
</script>

<a href={siteConfig.url} {...$$restProps}>
	<div class="w-3 h-3 rounded animate-pulse bg-primary"></div>
	<div class="title">{siteConfig.name}</div>
</a>
