<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Compass, House } from '@lucide/svelte';
</script>

<div
	class="fixed inset-0 z-100 bg-background text-foreground flex flex-col items-center justify-center p-4"
>
	<div class="text-center max-w-md w-full flex flex-col items-center">
		<h1
			class="text-[8rem] sm:text-[10rem] md:text-[12rem] font-black tracking-tighter leading-none mb-6 select-none bg-gradient-to-b from-white via-neutral-400 to-[#0a0a0a] bg-clip-text text-transparent"
		>
			{$page.status}
		</h1>

		<p class="text-neutral-300 mb-10 text-sm sm:text-base font-medium max-w-sm">
			{#if $page.status === 404}
				The page you're looking for might have been moved or doesn't exist.
			{:else}
				{$page.error?.message || 'An unexpected error occurred while loading this page.'}
			{/if}
		</p>

		<div class="flex items-center justify-center gap-4">
			<Button href="/" class="nodefault">
				<House />
				Go Home
			</Button>
			<Button href="/dashboard" class="nodefault" variant="outline">
				<Compass />
				Explore
			</Button>
		</div>
	</div>
</div>
