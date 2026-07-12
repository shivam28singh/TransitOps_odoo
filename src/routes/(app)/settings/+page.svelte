<script lang="ts">
	import type { PageData } from './$types';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Check } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let { data }: { data: PageData } = $props();

	let depotName = $derived(data.settings.depotName);
	let currency = $derived(data.settings.currency);
	let distanceUnit = $derived(data.settings.distanceUnit);
	let saving = $state(false);

	async function saveSettings() {
		saving = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					depotName,
					currency,
					distanceUnit
				})
			});

			if (res.ok) {
				toast.success('Settings saved successfully!');
			} else {
				const error = await res.json();
				toast.error(error.error || 'Failed to save settings.');
			}
		} catch (err) {
			toast.error('An error occurred while saving.');
		} finally {
			saving = false;
		}
	}
</script>

<div class="p-6 h-full flex flex-col md:flex-row gap-12">
	<!-- Left Side: General Settings -->
	<div class="w-full md:w-[350px] flex flex-col gap-6">
		<h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest">GENERAL</h2>

		<div class="space-y-4">
			<!-- Depot Name -->
			<div class="space-y-1.5">
				<label
					for="depotName"
					class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
					>Depot Name</label
				>
				<Input id="depotName" bind:value={depotName} class="bg-background/50 focus:bg-background" />
			</div>

			<!-- Currency -->
			<div class="space-y-1.5">
				<label
					for="currency"
					class="text-xs font-medium text-muted-foreground uppercase tracking-wider">Currency</label
				>
				<Input id="currency" bind:value={currency} class="bg-background/50 focus:bg-background" />
			</div>

			<!-- Distance Unit -->
			<div class="space-y-1.5">
				<label
					for="distanceUnit"
					class="text-xs font-medium text-muted-foreground uppercase tracking-wider"
					>Distance Unit</label
				>
				<Input
					id="distanceUnit"
					bind:value={distanceUnit}
					class="bg-background/50 focus:bg-background"
				/>
			</div>

			<div class="pt-2">
				<Button
					class="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-medium"
					disabled={saving || data.role !== 'ADMIN'}
					onclick={saveSettings}
				>
					{saving ? 'Saving...' : 'Save changes'}
				</Button>
				{#if data.role !== 'ADMIN'}
					<p class="text-xs text-muted-foreground mt-3 italic">
						Only administrators can modify settings.
					</p>
				{/if}
			</div>
		</div>
	</div>

	<!-- Divider for desktop -->
	<div class="hidden md:block w-px bg-border/50 my-2"></div>

	<!-- Right Side: RBAC -->
	<div class="flex-1 flex flex-col">
		<h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
			ROLE-BASED ACCESS (RBAC)
		</h2>

		<div class="overflow-x-auto">
			<table class="w-full text-sm text-left">
				<thead class="text-xs text-muted-foreground uppercase tracking-wider">
					<tr>
						<th class="px-4 py-3 font-medium border-b border-border/50">Role</th>
						<th class="px-4 py-3 font-medium border-b border-border/50 text-center">Fleet</th>
						<th class="px-4 py-3 font-medium border-b border-border/50 text-center">Driver</th>
						<th class="px-4 py-3 font-medium border-b border-border/50 text-center">Trip</th>
						<th
							class="px-4 py-3 font-medium border-b border-border/50 text-center whitespace-nowrap"
							>Fuel / Exp.</th
						>
						<th class="px-4 py-3 font-medium border-b border-border/50 text-center">Analytics</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border/30 text-muted-foreground">
					<tr class="hover:bg-muted/20 transition-colors">
						<td class="px-4 py-5 text-foreground font-medium">Fleet Manager</td>
						<td class="px-4 py-5 text-center"><Check class="size-4 mx-auto text-foreground" /></td>
						<td class="px-4 py-5 text-center"><Check class="size-4 mx-auto text-foreground" /></td>
						<td class="px-4 py-5 text-center">-</td>
						<td class="px-4 py-5 text-center">-</td>
						<td class="px-4 py-5 text-center"><Check class="size-4 mx-auto text-foreground" /></td>
					</tr>
					<tr class="hover:bg-muted/20 transition-colors">
						<td class="px-4 py-5 text-foreground font-medium">Dispatcher</td>
						<td class="px-4 py-5 text-center italic font-serif text-sm">view</td>
						<td class="px-4 py-5 text-center">-</td>
						<td class="px-4 py-5 text-center"><Check class="size-4 mx-auto text-foreground" /></td>
						<td class="px-4 py-5 text-center">-</td>
						<td class="px-4 py-5 text-center">-</td>
					</tr>
					<tr class="hover:bg-muted/20 transition-colors">
						<td class="px-4 py-5 text-foreground font-medium">Safety Officer</td>
						<td class="px-4 py-5 text-center">-</td>
						<td class="px-4 py-5 text-center"><Check class="size-4 mx-auto text-foreground" /></td>
						<td class="px-4 py-5 text-center italic font-serif text-sm">view</td>
						<td class="px-4 py-5 text-center">-</td>
						<td class="px-4 py-5 text-center">-</td>
					</tr>
					<tr class="hover:bg-muted/20 transition-colors">
						<td class="px-4 py-5 text-foreground font-medium">Financial Analyst</td>
						<td class="px-4 py-5 text-center italic font-serif text-sm">view</td>
						<td class="px-4 py-5 text-center">-</td>
						<td class="px-4 py-5 text-center">-</td>
						<td class="px-4 py-5 text-center"><Check class="size-4 mx-auto text-foreground" /></td>
						<td class="px-4 py-5 text-center"><Check class="size-4 mx-auto text-foreground" /></td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>
