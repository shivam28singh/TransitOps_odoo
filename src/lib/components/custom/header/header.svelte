<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import { createScroll } from '$lib/hooks/use-scroll.svelte';
	import { cn } from '$lib/utils';
	import Themetoggler from '../themetoggler.svelte';
	import MobileNav from './mobile-nav.svelte';
	import { navLinks } from './nav-links';
	let scroll = createScroll(10);
</script>

<header
	class={cn(
		'sticky top-0 z-50 mx-auto w-full max-w-4xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out',
		scroll.scrolled &&
			'border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-3xl md:shadow'
	)}
>
	<nav
		class={cn(
			'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out',
			scroll.scrolled && 'md:px-2'
		)}
	>
		<a class="nodefault flex items-center gap-2" href={resolve('/')}>
			<img src="/favicon.svg" alt="Logo" class="size-5" />
			<span class="font-bold">TransitOps</span>
		</a>
		<div class="hidden items-center gap-2 md:flex">
			<div>
				{#each navLinks as { label, href } (label)}
					<Button class="nodefault" variant="ghost" {href}>
						{label}
					</Button>
				{/each}
			</div>
			<Themetoggler />
			<Button class="nodefault" href={resolve('/signin')} variant="outline">Sign In</Button>
		</div>
		<MobileNav />
	</nav>
</header>
