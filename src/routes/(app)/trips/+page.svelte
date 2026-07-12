<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { XCircle, MapPin } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();

	let source = $state('');
	let destination = $state('');
	let vehicleId = $state('');
	let driverId = $state('');
	let cargoWeight = $state('');
	let distance = $state('');
	let submitting = $state(false);

	let selectedVehicle = $derived(
		vehicleId ? data.availableVehicles.find((v) => v.id.toString() === vehicleId) : null
	);

	let cargoExceedsCapacity = $derived(
		selectedVehicle && Number(cargoWeight) > Number(selectedVehicle.capacityKg)
	);

	let overage = $derived(
		selectedVehicle && cargoExceedsCapacity
			? Number(cargoWeight) - Number(selectedVehicle.capacityKg)
			: 0
	);

	async function handleSubmit(status: 'DRAFT' | 'DISPATCHED') {
		if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !distance) {
			toast.error('Please fill in all fields.');
			return;
		}

		if (status === 'DISPATCHED' && cargoExceedsCapacity) {
			toast.error('Cannot dispatch. Cargo exceeds capacity.');
			return;
		}

		submitting = true;
		try {
			const res = await fetch('/api/trips', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					source,
					destination,
					vehicleId: Number(vehicleId),
					driverId: Number(driverId),
					cargoWeightKg: Number(cargoWeight),
					distanceKm: Number(distance),
					status
				})
			});

			const result = await res.json();
			if (res.ok) {
				toast.success(`Trip successfully ${status === 'DRAFT' ? 'saved as draft' : 'dispatched'}!`);
				source = '';
				destination = '';
				vehicleId = '';
				driverId = '';
				cargoWeight = '';
				distance = '';
				await invalidateAll();
			} else {
				toast.error(result.error || 'Failed to create trip.');
			}
		} catch (err) {
			toast.error('An error occurred.');
		} finally {
			submitting = false;
		}
	}
</script>

<div class="p-6 h-full flex flex-col md:flex-row gap-6">
	<!-- Left Side: Form and Timeline -->
	<div class="w-full md:w-[450px] flex flex-col gap-8">
		<!-- Trip Lifecycle Timeline -->
		<div>
			<h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
				Trip Lifecycle
			</h2>
			<div class="flex items-center justify-between relative px-2">
				<!-- Track line -->
				<div class="absolute top-1/2 left-0 w-full h-[2px] bg-border -translate-y-1/2 z-0"></div>

				<div class="flex flex-col items-center gap-2 z-10">
					<div class="bg-background rounded-full p-1 border-2 border-emerald-500">
						<div class="w-3 h-3 rounded-full bg-emerald-500"></div>
					</div>
					<span class="text-xs font-medium text-emerald-500">Draft</span>
				</div>
				<div class="flex flex-col items-center gap-2 z-10">
					<div class="bg-background rounded-full p-1 border-2 border-blue-500">
						<div class="w-3 h-3 rounded-full bg-blue-500"></div>
					</div>
					<span class="text-xs font-medium text-blue-500">Dispatched</span>
				</div>
				<div class="flex flex-col items-center gap-2 z-10">
					<div class="bg-background rounded-full p-1 border-2 border-muted">
						<div class="w-3 h-3 rounded-full bg-muted"></div>
					</div>
					<span class="text-xs font-medium text-muted-foreground">Completed</span>
				</div>
				<div class="flex flex-col items-center gap-2 z-10">
					<div class="bg-background rounded-full p-1 border-2 border-muted">
						<div class="w-3 h-3 rounded-full bg-muted"></div>
					</div>
					<span class="text-xs font-medium text-muted-foreground">Cancelled</span>
				</div>
			</div>
		</div>

		<!-- Create Trip Form -->
		<div>
			<h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
				Create Trip
			</h2>

			<div class="space-y-4">
				<div class="space-y-1.5">
					<label for="source" class="text-xs font-medium text-muted-foreground">Source</label>
					<Input
						id="source"
						bind:value={source}
						placeholder="e.g. Gandhinagar Depot"
						class="bg-background"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="destination" class="text-xs font-medium text-muted-foreground"
						>Destination</label
					>
					<Input
						id="destination"
						bind:value={destination}
						placeholder="e.g. Ahmedabad Hub"
						class="bg-background"
					/>
				</div>

				<div class="space-y-1.5">
					<label for="vehicle" class="text-xs font-medium text-muted-foreground"
						>Vehicle (Available Only)</label
					>
					<Select.Root type="single" name="vehicleId" bind:value={vehicleId}>
						<Select.Trigger class="w-full">
							{selectedVehicle
								? `${selectedVehicle.name} - ${selectedVehicle.capacityKg} kg capacity`
								: 'Select a vehicle...'}
						</Select.Trigger>
						<Select.Content>
							{#each data.availableVehicles as vehicle, idx (idx)}
								<Select.Item value={vehicle.id.toString()} label={vehicle.name}>
									{vehicle.name} - {vehicle.capacityKg} kg capacity
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<label for="driver" class="text-xs font-medium text-muted-foreground"
						>Driver (Available Only)</label
					>
					<Select.Root type="single" name="driverId" bind:value={driverId}>
						<Select.Trigger class="w-full">
							{driverId
								? data.availableDrivers.find((d) => d.id.toString() === driverId)?.name
								: 'Select a driver...'}
						</Select.Trigger>
						<Select.Content>
							{#each data.availableDrivers as driver, idx (idx)}
								<Select.Item value={driver.id.toString()} label={driver.name}>
									{driver.name}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<label for="cargo" class="text-xs font-medium text-muted-foreground"
						>Cargo Weight (kg)</label
					>
					<Input id="cargo" type="number" bind:value={cargoWeight} placeholder="700" />
				</div>

				<div class="space-y-1.5">
					<label for="distance" class="text-xs font-medium text-muted-foreground"
						>Planned Distance (km)</label
					>
					<Input id="distance" type="number" bind:value={distance} placeholder="38" />
				</div>

				<!-- Validation Box -->
				{#if selectedVehicle && cargoWeight}
					<div
						class={`p-3 rounded-md border text-sm flex flex-col gap-1 transition-colors ${
							cargoExceedsCapacity
								? 'bg-destructive/10 border-destructive/50 text-destructive'
								: 'bg-muted/50 border-border text-muted-foreground'
						}`}
					>
						<span>Vehicle Capacity: <strong>{Number(selectedVehicle.capacityKg)} kg</strong></span>
						<span>Cargo Weight: <strong>{Number(cargoWeight)} kg</strong></span>
						{#if cargoExceedsCapacity}
							<div class="flex items-center gap-1.5 mt-1 font-medium">
								<XCircle class="size-4" />
								<span>Capacity exceeded by {overage} kg — dispatch blocked</span>
							</div>
						{/if}
					</div>
				{/if}

				<div class="flex items-center gap-3 pt-2">
					<Button
						variant="secondary"
						class="flex-1"
						disabled={submitting}
						onclick={() => handleSubmit('DRAFT')}
					>
						Save as Draft
					</Button>
					<Button
						class="flex-1"
						disabled={cargoExceedsCapacity || submitting}
						onclick={() => handleSubmit('DISPATCHED')}
					>
						Dispatch
					</Button>
				</div>
			</div>
		</div>
	</div>

	<!-- Divider for desktop -->
	<div class="hidden md:block w-px bg-border my-6"></div>

	<!-- Right Side: Live Board -->
	<div class="flex-1 flex flex-col">
		<h2 class="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
			Live Board
		</h2>

		{#if data.trips.length === 0}
			<div
				class="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg"
			>
				<MapPin class="size-8 mb-2 opacity-50" />
				<p>No active trips found.</p>
			</div>
		{:else}
			<div class="flex flex-col gap-4 overflow-y-auto">
				{#each data.trips as trip, idx (idx)}
					<div class="p-4 rounded-lg border border-border bg-card flex flex-col gap-3">
						<div class="flex justify-between items-start">
							<div class="font-medium text-foreground tracking-tight">
								TR{trip.id.toString().padStart(3, '0')}
							</div>
							<div class="text-sm text-muted-foreground uppercase tracking-wider text-right">
								{trip.vehicleName} / {trip.driverName}
							</div>
						</div>

						<div class="text-lg font-semibold flex items-center gap-2">
							{trip.startLocation}
							<span class="text-muted-foreground text-sm font-normal">→</span>
							{trip.endLocation}
						</div>

						<div class="flex items-center justify-between mt-2">
							{#if trip.status === 'DRAFT'}
								<Badge variant="secondary" class="bg-muted text-muted-foreground">Draft</Badge>
							{:else if trip.status === 'DISPATCHED'}
								<Badge variant="default" class="bg-blue-500 hover:bg-blue-600 text-white"
									>Dispatched</Badge
								>
							{:else if trip.status === 'COMPLETED'}
								<Badge variant="outline" class="border-emerald-500 text-emerald-500"
									>Completed</Badge
								>
							{:else if trip.status === 'CANCELLED'}
								<Badge variant="destructive">Cancelled</Badge>
							{/if}

							<div class="text-sm text-muted-foreground">
								{#if trip.status === 'DRAFT'}
									Awaiting dispatch
								{:else if trip.status === 'DISPATCHED'}
									In transit
								{:else if trip.status === 'CANCELLED'}
									Cancelled
								{:else}
									Done
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<div class="mt-auto pt-6 text-xs text-muted-foreground italic opacity-60">
			On Complete: odometer -> fuel log -> expenses -> Vehicle & Driver Available
		</div>
	</div>
</div>
