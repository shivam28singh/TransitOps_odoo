<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { Fuel, ReceiptText, Plus } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	// Modal States
	let isLogFuelOpen = $state(false);
	let isAddExpenseOpen = $state(false);

	// Log Fuel Form
	let fuelVehicleId = $state('');
	let fuelDate = $state('');
	let fuelLiters = $state('');
	let fuelCost = $state('');
	let submittingFuel = $state(false);

	// Add Expense Form
	let expenseTripId = $state('');
	let expenseTollCost = $state('');
	let expenseOtherCost = $state('');
	let submittingExpense = $state(false);

	async function handleLogFuel() {
		if (!fuelVehicleId || !fuelDate || !fuelLiters || !fuelCost) {
			toast.error('Please fill in all fuel details.');
			return;
		}
		submittingFuel = true;
		try {
			const res = await fetch('/api/fuel', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					vehicleId: Number(fuelVehicleId),
					liters: Number(fuelLiters),
					cost: Number(fuelCost),
					date: fuelDate
				})
			});
			if (res.ok) {
				toast.success('Fuel log added successfully!');
				isLogFuelOpen = false;
				fuelVehicleId = '';
				fuelDate = '';
				fuelLiters = '';
				fuelCost = '';
				await invalidateAll();
			} else {
				const resData = await res.json();
				toast.error(resData.error || 'Failed to add fuel log');
			}
		} catch (error) {
			toast.error('An error occurred.');
		} finally {
			submittingFuel = false;
		}
	}

	async function handleAddExpense() {
		if (!expenseTripId) {
			toast.error('Please select a trip.');
			return;
		}
		submittingExpense = true;
		try {
			const res = await fetch(`/api/trips/${expenseTripId}/expense`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					tollCost: Number(expenseTollCost || 0),
					otherCost: Number(expenseOtherCost || 0)
				})
			});
			if (res.ok) {
				toast.success('Expense added to trip successfully!');
				isAddExpenseOpen = false;
				expenseTripId = '';
				expenseTollCost = '';
				expenseOtherCost = '';
				await invalidateAll();
			} else {
				const resData = await res.json();
				toast.error(resData.error || 'Failed to add expense');
			}
		} catch (error) {
			toast.error('An error occurred.');
		} finally {
			submittingExpense = false;
		}
	}

	function formatCurrency(amount: string | number | null) {
		if (!amount) return '0.00';
		return new Intl.NumberFormat('en-IN', {
			style: 'currency',
			currency: 'INR'
		}).format(Number(amount));
	}
</script>

<div class="p-6 h-full flex flex-col space-y-8">
	<!-- Header Section -->
	<div class="flex items-center justify-between">
		<h1 class="text-lg font-semibold tracking-tight">FUEL & EXPENSES</h1>
		<div class="flex items-center gap-3">
			<Button variant="outline" onclick={() => (isLogFuelOpen = true)}>
				<Plus class="size-4 mr-1" /> Log Fuel
			</Button>
			<Button variant="outline" onclick={() => (isAddExpenseOpen = true)}>
				<Plus class="size-4 mr-1" /> Add Expense
			</Button>
		</div>
	</div>

	<!-- Fuel Logs Section -->
	<div class="flex flex-col space-y-4">
		<h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest">FUEL LOGS</h2>

		<div class="border rounded-md bg-card overflow-hidden">
			<table class="w-full text-sm text-left">
				<thead class="text-xs text-muted-foreground uppercase border-b border-border">
					<tr>
						<th class="px-4 py-3 font-medium">Vehicle</th>
						<th class="px-4 py-3 font-medium">Date</th>
						<th class="px-4 py-3 font-medium text-right">Liters</th>
						<th class="px-4 py-3 font-medium text-right">Fuel Cost</th>
					</tr>
				</thead>
				<tbody class="divide-y border-border">
					{#each data.fuelLogs as log, idx (idx)}
						<tr class="hover:bg-muted/50 transition-colors">
							<td class="px-4 py-3 font-medium">{log.vehicleName}</td>
							<td class="px-4 py-3 text-muted-foreground"
								>{new Date(log.date).toLocaleDateString('en-GB', {
									day: '2-digit',
									month: 'short',
									year: 'numeric'
								})}</td
							>
							<td class="px-4 py-3 text-right">{log.liters} L</td>
							<td class="px-4 py-3 text-right tabular-nums">{formatCurrency(log.cost)}</td>
						</tr>
					{/each}
					{#if data.fuelLogs.length === 0}
						<tr>
							<td colspan="4" class="px-4 py-8 text-center text-muted-foreground">
								<Fuel class="size-8 mx-auto mb-2 opacity-30" />
								No fuel logs recorded yet.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Other Expenses Section -->
	<div class="flex flex-col space-y-4">
		<h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
			OTHER EXPENSES (TOLL / MISC)
		</h2>

		<div class="border rounded-md bg-card overflow-hidden">
			<table class="w-full text-sm text-left">
				<thead class="text-xs text-muted-foreground uppercase border-b border-border">
					<tr>
						<th class="px-4 py-3 font-medium">Trip</th>
						<th class="px-4 py-3 font-medium">Vehicle</th>
						<th class="px-4 py-3 font-medium text-right">Toll</th>
						<th class="px-4 py-3 font-medium text-right">Other</th>
						<th class="px-4 py-3 font-medium text-right">Maint. (Linked)</th>
						<th class="px-4 py-3 font-medium text-center">Total</th>
					</tr>
				</thead>
				<tbody class="divide-y border-border">
					{#each data.trips.filter((t) => Number(t.tollCost) > 0 || Number(t.otherCost) > 0 || t.maintLinked > 0) as trip, idx (idx)}
						<tr class="hover:bg-muted/50 transition-colors">
							<td class="px-4 py-3 font-medium">TR{trip.id.toString().padStart(3, '0')}</td>
							<td class="px-4 py-3 text-muted-foreground">{trip.vehicleRegNo}</td>
							<td class="px-4 py-3 text-right tabular-nums">{formatCurrency(trip.tollCost)}</td>
							<td class="px-4 py-3 text-right tabular-nums">{formatCurrency(trip.otherCost)}</td>
							<td class="px-4 py-3 text-right tabular-nums text-muted-foreground"
								>{formatCurrency(trip.maintLinked)}</td
							>
							<td class="px-4 py-3 text-center">
								<Badge
									variant="outline"
									class="border-emerald-500/30 bg-emerald-500/10 text-emerald-500 tabular-nums"
								>
									{formatCurrency(
										Number(trip.tollCost || 0) + Number(trip.otherCost || 0) + trip.maintLinked
									)}
								</Badge>
							</td>
						</tr>
					{/each}
					{#if data.trips.filter((t) => Number(t.tollCost) > 0 || Number(t.otherCost) > 0 || t.maintLinked > 0).length === 0}
						<tr>
							<td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
								<ReceiptText class="size-8 mx-auto mb-2 opacity-30" />
								No other expenses recorded yet.
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>

	<!-- Total Operational Cost Footer -->
	<div
		class="mt-auto pt-6 border-t border-border flex items-center justify-between uppercase text-sm font-semibold tracking-widest text-muted-foreground"
	>
		<span>TOTAL OPERATIONAL COST (AUTO) = FUEL + MAINT</span>
		<span class="text-amber-500 text-lg">{formatCurrency(data.totalOperationalCost)}</span>
	</div>
</div>

<!-- Log Fuel Dialog -->
<Dialog.Root bind:open={isLogFuelOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Log Fuel</Dialog.Title>
			<Dialog.Description>Record a new fuel transaction for a vehicle.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="space-y-1.5">
				<label for="fuelVehicleId" class="text-xs font-medium text-muted-foreground">Vehicle</label>
				<Select.Root type="single" name="fuelVehicleId" bind:value={fuelVehicleId}>
					<Select.Trigger class="w-full">
						{fuelVehicleId
							? data.vehicles.find((v) => v.id.toString() === fuelVehicleId)?.name
							: 'Select Vehicle'}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Vehicle</Select.GroupHeading>
							{#each data.vehicles as v, idx (idx)}
								<Select.Item value={v.id.toString()} label={v.name}
									>{v.name} ({v.regNo})</Select.Item
								>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-1.5">
				<label for="date" class="text-xs font-medium text-muted-foreground">Date</label>
				<Input id="date" type="date" bind:value={fuelDate} />
			</div>
			<div class="space-y-1.5">
				<label for="liters" class="text-xs font-medium text-muted-foreground">Liters Added</label>
				<Input
					id="liters"
					type="number"
					step="0.01"
					bind:value={fuelLiters}
					placeholder="e.g. 40"
				/>
			</div>
			<div class="space-y-1.5">
				<label for="cost" class="text-xs font-medium text-muted-foreground">Total Cost</label>
				<Input id="cost" type="number" step="0.01" bind:value={fuelCost} placeholder="e.g. 3500" />
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (isLogFuelOpen = false)}>Cancel</Button>
			<Button disabled={submittingFuel} onclick={handleLogFuel}
				>{submittingFuel ? 'Saving...' : 'Save Fuel Log'}</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Add Expense Dialog -->
<Dialog.Root bind:open={isAddExpenseOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Add Expense (Toll / Misc)</Dialog.Title>
			<Dialog.Description>Add additional costs to a specific trip.</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="space-y-1.5">
				<label for="expenseTripId" class="text-xs font-medium text-muted-foreground">Trip</label>
				<Select.Root type="single" name="expenseTripId" bind:value={expenseTripId}>
					<Select.Trigger class="w-full">
						{expenseTripId ? `TR${expenseTripId.padStart(3, '0')}` : 'Select Trip'}
					</Select.Trigger>
					<Select.Content>
						{#each data.trips as t, idx (idx)}
							<Select.Item value={t.id.toString()} label={`TR${t.id.toString().padStart(3, '0')}`}>
								TR{t.id.toString().padStart(3, '0')} - {t.vehicleRegNo}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="space-y-1.5">
				<label for="tollCost" class="text-xs font-medium text-muted-foreground">Toll Cost</label>
				<Input
					id="tollCost"
					type="number"
					step="0.01"
					bind:value={expenseTollCost}
					placeholder="e.g. 150"
				/>
			</div>
			<div class="space-y-1.5">
				<label for="otherCost" class="text-xs font-medium text-muted-foreground"
					>Other / Misc Cost</label
				>
				<Input
					id="otherCost"
					type="number"
					step="0.01"
					bind:value={expenseOtherCost}
					placeholder="e.g. 50"
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (isAddExpenseOpen = false)}>Cancel</Button>
			<Button disabled={submittingExpense} onclick={handleAddExpense}
				>{submittingExpense ? 'Saving...' : 'Add Expense'}</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
