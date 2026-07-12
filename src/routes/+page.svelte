<script lang="ts">
	import { resolve } from '$app/paths';
	import Header from '$lib/components/custom/header/header.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		ArrowRight,
		Rocket,
		Gauge,
		Activity,
		ShieldCheck,
		Zap,
		LineChart,
		ChartLine
	} from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import type { Component } from 'svelte';
	import TestimonialThree from '$lib/components/efferd/testimonial/testimonial-three.svelte';
	const { data } = $props();

	type Feature = {
		title: string;
		icon: Component;
		description: string;
	};

	const features: Feature[] = [
		{
			title: 'Optimized Dispatch',
			icon: Zap,
			description: 'Intelligent routing and swift vehicle dispatching.'
		},
		{
			title: 'Secure Operations',
			icon: ShieldCheck,
			description: 'Role-based access and secure data handling.'
		},
		{
			title: 'Live Tracking',
			icon: Activity,
			description: 'Real-time sync across your entire fleet.'
		},
		{
			title: 'Rich Analytics',
			icon: ChartLine,
			description: 'Data-driven insights for operational efficiency.'
		}
	];
</script>

<Header user={data.user} />

<section class="relative -top-14 mx-auto w-full max-w-5xl px-4">
	<div
		aria-hidden="true"
		class="absolute inset-0 isolate hidden overflow-hidden contain-strict lg:block"
	>
		<div
			class="absolute inset-0 top-0 isolate -z-20 bg-[radial-gradient(35%_80%_at_49%_0%,color-mix(in_oklab,var(--foreground)_8%,transparent),transparent)] contain-strict"
		></div>
	</div>
	<div
		aria-hidden="true"
		class="absolute inset-0 mx-auto hidden min-h-screen w-full max-w-5xl lg:block"
	>
		<div
			class="absolute inset-y-0 left-0 z-10 h-full w-px bg-foreground/15 mask-[linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)]"
		></div>
		<div
			class="absolute inset-y-0 right-0 z-10 h-full w-px bg-foreground/15 mask-[linear-gradient(to_bottom,transparent_0%,black_20%,black_80%,transparent_100%)]"
		></div>
	</div>
	<div class="relative flex flex-col items-center justify-center gap-5 pt-46 pb-10">
		<div aria-hidden="true" class="absolute inset-0 top-14 -z-10 size-full overflow-hidden">
			<div
				class="absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent via-border to-border md:left-4"
			></div>
			<div
				class="absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent via-border to-border md:right-4"
			></div>
			<div
				class="absolute inset-y-0 left-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:left-12"
			></div>
			<div
				class="absolute inset-y-0 right-8 w-px bg-linear-to-b from-transparent via-border/50 to-border/50 md:right-12"
			></div>
		</div>
		<span
			class="group mx-auto flex w-fit animate-in items-center gap-3 rounded-full border bg-card px-3 py-1 shadow transition-all delay-500 duration-500 ease-out fill-mode-backwards slide-in-from-bottom-10 fade-in"
		>
			<Rocket class="size-3 text-muted-foreground" />
			<span class="text-xs">transit operations simplified</span>
			<span class="block h-5 border-l"></span>
			<ArrowRight class="size-3 duration-150 ease-out group-hover:translate-x-1" />
		</span>
		<h1
			class="animate-in text-center text-4xl tracking-tight text-balance delay-100 duration-500 ease-out fill-mode-backwards slide-in-from-bottom-10 [text-shadow:0_0_50px_color-mix(in_oklab,var(--foreground)_20%,transparent)] fade-in md:text-5xl lg:text-6xl"
		>
			Master Your Fleet with
			<br />
			TransitOps
		</h1>
		<p
			class="mx-auto max-w-md animate-in text-center text-base tracking-wider text-foreground/80 delay-200 duration-500 ease-out fill-mode-backwards slide-in-from-bottom-10 fade-in sm:text-lg md:text-xl"
		>
			Streamline operations, optimize routes,
			<br />
			and scale your transit business.
		</p>
		<div
			class="flex animate-in flex-row flex-wrap items-center justify-center gap-3 pt-2 delay-300 duration-500 ease-out fill-mode-backwards slide-in-from-bottom-10 fade-in"
		>
			<Button class="rounded-full nodefault" href={resolve('/dashboard')} size="lg">
				Go to Dashboard
				<Gauge class="size-4 ml-2" />
			</Button>
		</div>
	</div>
</section>

<div
	class="mx-auto grid max-w-5xl grid-cols-2 gap-4 py-16 px-4 md:grid-cols-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500 fill-mode-backwards"
>
	{#each features as feature, index (feature.title)}
		{@const FeatureIcon = feature.icon}
		<div
			class={cn(
				'relative flex flex-col items-center justify-center p-4',
				'after:absolute after:inset-y-0 after:right-0 after:h-full after:w-px after:bg-linear-to-b after:from-foreground/5 after:via-foreground/20 after:to-foreground/5',
				'[&_svg]:size-8 [&_svg]:text-muted-foreground',
				{
					'after:hidden': index === features.length - 1,
					'after:hidden after:md:block': index === 1
				}
			)}
		>
			<FeatureIcon />
			<h3 class="mt-6 text-center text-sm font-semibold md:text-base lg:text-lg">
				{feature.title}
			</h3>
			<p class="mt-2 text-center text-xs text-muted-foreground md:text-sm">
				{feature.description}
			</p>
		</div>
	{/each}
</div>

<div>
	<TestimonialThree />
</div>
