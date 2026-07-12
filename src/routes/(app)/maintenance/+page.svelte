<script lang="ts">
	import type { PageData } from './$types';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { ArrowRight, Wrench, CircleCheck } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { getLocalTimeZone, type CalendarDate } from '@internationalized/date';
	import { cn } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	let vehicleId = $state('');
	let serviceType = $state('');
	let cost = $state('');
	let date = $state<CalendarDate | undefined>();
	let popoverOpen = $state(false);
	let status = $state<'ACTIVE' | 'COMPLETED'>('ACTIVE');
	let submitting = $state(false);
	let updatingStatus = $state(false);

	async function handleCompleteMaintenance(id: number) {
		updatingStatus = true;
		try {
			const res = await fetch(`/api/maintenance/${id}`, {
				method: 'PUT'
			});
			if (res.ok) {
				toast.success('Maintenance completed and vehicle available.');
				await invalidateAll();
			} else {
				const result = await res.json();
				toast.error(result.error || 'Failed to complete maintenance.');
			}
		} catch (err) {
			toast.error('An error occurred.');
		} finally {
			updatingStatus = false;
		}
	}

	async function handleSubmit() {
		if (!vehicleId || !serviceType || !cost || !date) {
			toast.error('Please fill in all fields.');
			return;
		}

		submitting = true;
		try {
			const res = await fetch('/api/maintenance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					vehicleId: Number(vehicleId),
					serviceType,
					cost: Number(cost),
					date: date.toString(),
					status
				})
			});

			const result = await res.json();
			if (res.ok) {
				toast.success('Maintenance record created successfully!');
				vehicleId = '';
				serviceType = '';
				cost = '';
				date = undefined;
				status = 'ACTIVE';
				await invalidateAll();
			} else {
				toast.error(result.error || 'Failed to create record.');
			}
		} catch (err) {
			toast.error('An error occurred.');
		} finally {
			submitting = false;
		}
	}
</script>

<div class="p-6 h-full flex flex-col md:flex-row gap-6">
	<!-- Left Side: Form -->
	<div class="w-full md:w-[450px] flex flex-col gap-6">
		<h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
			Log Service Record
		</h2>

		<div class="space-y-4">
			<!-- Vehicle -->
			<div class="space-y-1.5">
				<label for="vehicle" class="text-xs font-medium text-muted-foreground">Vehicle</label>
				<Select.Root type="single" name="vehicleId" bind:value={vehicleId}>
					<Select.Trigger class="w-full bg-background">
						{vehicleId
							? data.vehicles.find((v) => v.id.toString() === vehicleId)?.name
							: 'Select vehicle...'}
					</Select.Trigger>
					<Select.Content>
						{#each data.vehicles as vehicle, idx (idx)}
							<Select.Item value={vehicle.id.toString()} label={vehicle.name}>
								{vehicle.name} ({vehicle.regNo})
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Service Type -->
			<div class="space-y-1.5">
				<label for="serviceType" class="text-xs font-medium text-muted-foreground"
					>Service Type</label
				>
				<Input
					id="serviceType"
					bind:value={serviceType}
					placeholder="e.g. Oil Change"
					class="bg-background"
				/>
			</div>

			<!-- Cost -->
			<div class="space-y-1.5">
				<label for="cost" class="text-xs font-medium text-muted-foreground">Cost</label>
				<Input
					id="cost"
					type="number"
					bind:value={cost}
					placeholder="e.g. 2500"
					class="bg-background"
				/>
			</div>

			<!-- Date -->
			<div class="space-y-1.5 flex flex-col">
				<label for="date" class="text-xs font-medium text-muted-foreground">Date</label>
				<Popover.Root bind:open={popoverOpen}>
					<Popover.Trigger>
						<Button
							variant="outline"
							class={cn(
								'w-full justify-start text-start font-normal bg-background',
								!date && 'text-muted-foreground'
							)}
						>
							<CalendarIcon class="mr-2 h-4 w-4" />
							{date ? date.toDate(getLocalTimeZone()).toLocaleDateString() : 'Select date'}
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-auto p-0">
						<Calendar
							bind:value={date}
							type="single"
							initialFocus
							onValueChange={() => {
								popoverOpen = false;
							}}
						/>
					</Popover.Content>
				</Popover.Root>
			</div>

			<!-- Status -->
			<div class="space-y-1.5">
				<label for="status" class="text-xs font-medium text-muted-foreground">Status</label>
				<Select.Root type="single" name="status" bind:value={status}>
					<Select.Trigger class="w-full bg-background">
						{status === 'ACTIVE' ? 'Active' : 'Completed'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="ACTIVE" label="Active">Active</Select.Item>
						<Select.Item value="COMPLETED" label="Completed">Completed</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Save Button -->
			<Button class="w-full" disabled={submitting} onclick={handleSubmit}>
				{submitting ? 'Saving...' : 'Save'}
			</Button>

			<!-- State Diagram -->
			<div class="mt-8 p-4 rounded-lg bg-card border border-border">
				<div class="flex items-center justify-between text-sm mb-4">
					<span class="font-medium text-emerald-500">Available</span>
					<div class="flex flex-col items-center flex-1 px-4 text-xs text-muted-foreground">
						<span>creating active record</span>
						<div class="w-full h-px bg-border flex items-center justify-end relative my-1">
							<ArrowRight class="size-4 absolute -right-2 text-border" />
						</div>
					</div>
					<span class="font-medium text-orange-500 whitespace-nowrap">In Shop</span>
				</div>

				<div class="flex items-center justify-between text-sm">
					<span class="font-medium text-orange-500">In Shop</span>
					<div class="flex flex-col items-center flex-1 px-4 text-xs text-muted-foreground">
						<span>closing record (not retired)</span>
						<div class="w-full h-px bg-border flex items-center justify-end relative my-1">
							<ArrowRight class="size-4 absolute -right-2 text-border" />
						</div>
					</div>
					<span class="font-medium text-emerald-500 whitespace-nowrap">Available</span>
				</div>

				<p class="text-xs text-orange-500 mt-4 italic">
					Note: In Shop vehicles are removed from the dispatch pool.
				</p>
			</div>
		</div>
	</div>

	<!-- Divider for desktop -->
	<div class="hidden md:block w-px bg-border my-6"></div>

	<!-- Right Side: Service Log -->
	<div class="flex-1 flex flex-col">
		<h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
			Service Log
		</h2>

		{#if data.maintenanceLogs.length === 0}
			<div
				class="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg"
			>
				<Wrench class="size-8 mb-2 opacity-50" />
				<p>No maintenance records found.</p>
			</div>
		{:else}
			<div class="border rounded-md bg-card overflow-hidden">
				<table class="w-full text-sm text-left">
					<thead class="text-xs text-muted-foreground uppercase bg-muted/50">
						<tr>
							<th class="px-4 py-3 font-medium">Vehicle</th>
							<th class="px-4 py-3 font-medium">Service</th>
							<th class="px-4 py-3 font-medium text-right">Cost</th>
							<th class="px-4 py-3 font-medium text-center">Status</th>
						</tr>
					</thead>
					<tbody class="divide-y">
						{#each data.maintenanceLogs as log, idx (idx)}
							<tr class="hover:bg-muted/50 transition-colors">
								<td class="px-4 py-3 font-medium">{log.vehicleName}</td>
								<td class="px-4 py-3">{log.serviceType}</td>
								<td class="px-4 py-3 text-right tabular-nums">
									{new Intl.NumberFormat('en-IN', {
										style: 'currency',
										currency: 'INR'
									}).format(Number(log.cost))}
								</td>
								<td class="px-4 py-3 text-center">
									{#if log.status === 'ACTIVE'}
										<div class="flex items-center justify-center gap-2">
											<Badge
												variant="outline"
												class="border-orange-500 text-orange-500 bg-orange-500/10">In Shop</Badge
											>
											<Button
												variant="outline"
												size="sm"
												class="h-6 text-[10px] px-2 py-0 border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
												onclick={() => handleCompleteMaintenance(log.id)}
												disabled={updatingStatus}
											>
												<CircleCheck /> Close
											</Button>
										</div>
									{:else}
										<Badge
											variant="outline"
											class="border-emerald-500 text-emerald-500 bg-emerald-500/10">Completed</Badge
										>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
