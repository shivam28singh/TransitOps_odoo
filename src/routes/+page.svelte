<script lang="ts">
	import { resolve } from '$app/paths';
	import Header from '$lib/components/custom/header/header.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowRight, Rocket, Gauge, Activity, ShieldCheck, Zap, ChartLine } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import type { Component } from 'svelte';
	import TestimonialThree from '$lib/components/efferd/testimonial/testimonial-three.svelte';
	import {
		Accordion,
		AccordionContent,
		AccordionItem,
		AccordionTrigger
	} from '$lib/components/ui/accordion';
	const { data } = $props();

	type Question = {
		id: string;
		title: string;
		content: string;
	};

	const questions: Question[] = [
		{
			id: 'item-1',
			title: 'What is TransitOps?',
			content:
				'TransitOps is a comprehensive fleet and transit management system designed to streamline your daily operations, from dispatching to vehicle maintenance.'
		},
		{
			id: 'item-2',
			title: 'Who can benefit from TransitOps?',
			content:
				'TransitOps is built for fleet managers, dispatchers, and transportation companies looking to digitize their workflows, reduce costs, and improve operational efficiency.'
		},
		{
			id: 'item-3',
			title: 'Does it support real-time vehicle tracking?',
			content:
				'Yes, TransitOps provides live tracking of your fleet, allowing dispatchers to make informed decisions and optimize routes dynamically.'
		},
		{
			id: 'item-4',
			title: 'Can I track fuel and maintenance expenses?',
			content:
				'Absolutely. Our unified financial dashboard automatically calculates total operational costs per vehicle, linking fuel logs and maintenance records seamlessly.'
		},
		{
			id: 'item-5',
			title: 'Is there role-based access control?',
			content:
				'Yes. TransitOps features granular RBAC (Role-Based Access Control) to ensure that Fleet Managers, Dispatchers, and Safety Officers only access the data and tools they need.'
		},
		{
			id: 'item-6',
			title: 'How do I get started?',
			content:
				'You can book a demo with our team or dive straight into the dashboard to start setting up your depots, vehicles, and driver profiles today.'
		}
	];

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
	id="features"
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

<div
	id="testimonials"
	class="w-full flex flex-col items-center justify-center py-20 px-4 relative overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-700 delay-[600ms] fill-mode-backwards"
>
	<div class="text-center mb-16 max-w-3xl mx-auto space-y-4">
		<h2 class="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground">
			Trusted by Industry Leaders
		</h2>
		<p class="text-muted-foreground text-base sm:text-lg">
			See what top operators are saying about TransitOps and how it transforms their fleet
			management.
		</p>
	</div>
	<div class="w-full">
		<TestimonialThree />
	</div>
</div>

<div
	id="faqs"
	class="mx-auto w-full max-w-3xl space-y-7 px-4 py-24 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-[600ms] fill-mode-backwards"
>
	<div class="space-y-4 text-center mb-10">
		<h2 class="text-3xl font-bold tracking-tight md:text-4xl text-foreground">
			Frequently Asked Questions
		</h2>
		<p class="max-w-2xl mx-auto text-muted-foreground sm:text-lg">
			Here are some common questions and answers that you might encounter when using TransitOps. If
			you don't find the answer you're looking for, feel free to reach out.
		</p>
	</div>

	<Accordion type="single" class="rounded-lg border border-border/50">
		{#each questions as item (item.id)}
			<AccordionItem value={item.id} class="px-6 border-border/50">
				<AccordionTrigger
					class="py-5 hover:no-underline font-medium text-left focus-visible:underline focus-visible:ring-0"
				>
					{item.title}
				</AccordionTrigger>
				<AccordionContent class="text-muted-foreground pb-5 leading-relaxed">
					{item.content}
				</AccordionContent>
			</AccordionItem>
		{/each}
	</Accordion>

	<p class="text-muted-foreground text-center pt-8">
		Can't find what you're looking for? Contact our
		<a class="text-primary font-medium hover:underline" href="mailto:support@transitops.com">
			customer support team
		</a>
	</p>
</div>

<!-- Footer -->
<footer class="border-t border-border mt-12 bg-card/50">
	<div
		class="mx-auto max-w-5xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4"
	>
		<p class="text-sm text-muted-foreground">
			&copy; {new Date().getFullYear()} TransitOps. All rights reserved.
		</p>
		<div class="flex items-center gap-6 text-sm text-muted-foreground">
			<a href={resolve('/terms')} class="hover:text-foreground transition-colors"
				>Terms of Service</a
			>
			<a href={resolve('/privacy')} class="hover:text-foreground transition-colors"
				>Privacy Policy</a
			>
		</div>
	</div>
</footer>
