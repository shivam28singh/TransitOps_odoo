<script lang="ts" module>
	let open = $state(false);
	let onSuccessCallback = $state<((newVehicle: any) => void) | null>(null);

	export const openAddVehicle = (callback?: (newVehicle: any) => void) => {
		open = true;
		if (callback) {
			onSuccessCallback = callback;
		}
	};
</script>

<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';

	let regNo = $state('');
	let name = $state('');
	let type = $state<'VAN' | 'TRUCK' | 'MINI'>('VAN');
	let capacityKg = $state<number | null>(null);
	let odometerKm = $state<number | null>(0);
	let acquisitionCost = $state<number | null>(null);
	let region = $state('');
	let submitting = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		submitting = true;
		try {
			const res = await fetch('/api/fleet/vehicle', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					regNo,
					name,
					type,
					capacityKg,
					odometerKm,
					acquisitionCost,
					region: region || undefined
				})
			});
			const resData = await res.json();
			if (!res.ok) {
				toast.error(resData.error || 'Failed to add vehicle');
				return;
			}
			toast.success('Vehicle added successfully');
			open = false;

			// Reset local bindings
			regNo = '';
			name = '';
			type = 'VAN';
			capacityKg = null;
			odometerKm = 0;
			acquisitionCost = null;
			region = '';

			if (onSuccessCallback) {
				onSuccessCallback(resData.vehicle);
			}
			await invalidateAll();
		} catch (error: any) {
			toast.error(error.message || 'An error occurred');
		} finally {
			submitting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[480px]">
		<Dialog.Header>
			<Dialog.Title>Add New Vehicle</Dialog.Title>
			<Dialog.Description>
				Enter details to add a new vehicle to the registry. Registration number must be unique.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4 py-4">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-1.5 col-span-2">
					<label for="regNo" class="text-xs font-medium text-muted-foreground"
						>Registration Number *</label
					>
					<Input
						id="regNo"
						name="regNo"
						bind:value={regNo}
						placeholder="e.g. GJ01AB1234"
						required
					/>
				</div>

				<div class="space-y-1.5 col-span-2">
					<label for="name" class="text-xs font-medium text-muted-foreground"
						>Vehicle Name / Model *</label
					>
					<Input
						id="name"
						name="name"
						bind:value={name}
						placeholder="e.g. Tata Ultra 1918"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<label for="type" class="text-xs font-medium text-muted-foreground">Vehicle Type *</label>
					<Select.Root type="single" name="type" bind:value={type}>
						<Select.Trigger class="w-full">
							{type === 'VAN' ? 'Van' : type === 'TRUCK' ? 'Truck' : 'Mini'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="VAN" label="Van">Van</Select.Item>
							<Select.Item value="TRUCK" label="Truck">Truck</Select.Item>
							<Select.Item value="MINI" label="Mini">Mini</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-1.5">
					<label for="capacity" class="text-xs font-medium text-muted-foreground"
						>Capacity (kg) *</label
					>
					<Input
						id="capacity"
						name="capacityKg"
						type="number"
						bind:value={capacityKg}
						placeholder="e.g. 1500"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<label for="odometer" class="text-xs font-medium text-muted-foreground"
						>Odometer (km) *</label
					>
					<Input
						id="odometer"
						name="odometerKm"
						type="number"
						bind:value={odometerKm}
						placeholder="e.g. 12000"
						required
					/>
				</div>

				<div class="space-y-1.5">
					<label for="cost" class="text-xs font-medium text-muted-foreground"
						>Acquisition Cost (₹) *</label
					>
					<Input
						id="cost"
						name="acquisitionCost"
						type="number"
						bind:value={acquisitionCost}
						placeholder="e.g. 850000"
						required
					/>
				</div>

				<div class="space-y-1.5 col-span-2">
					<label for="region" class="text-xs font-medium text-muted-foreground"
						>Operating Region</label
					>
					<Input id="region" name="region" bind:value={region} placeholder="e.g. West" />
				</div>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={submitting}>
					{submitting ? 'Adding...' : 'Add Vehicle'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
