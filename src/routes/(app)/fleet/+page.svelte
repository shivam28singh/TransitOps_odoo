<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Search, Plus } from '@lucide/svelte';

	let { data } = $props();

	// Bound states for filters
	let selectedType = $state('All');
	let selectedStatus = $state('All');
	let searchQuery = $state('');

	// Client-side filtering logic
	let filteredVehicles = $derived(
		data.vehicles.filter((v) => {
			if (selectedType !== 'All' && v.type !== selectedType) return false;
			if (selectedStatus !== 'All' && v.status !== selectedStatus) return false;
			if (
				searchQuery.trim() !== '' &&
				!v.regNo.toLowerCase().includes(searchQuery.trim().toLowerCase())
			)
				return false;
			return true;
		})
	);

	// Formatters
	const formatCurrency = (val: string | number) => {
		return new Intl.NumberFormat('en-IN', {
			maximumFractionDigits: 0
		}).format(Number(val));
	};

	const formatCapacity = (val: string | number) => {
		const num = Number(val);
		if (num >= 1000) {
			return `${(num / 1000).toFixed(1).replace(/\.0$/, '')} Ton`;
		}
		return `${num} kg`;
	};
</script>

<div class="p-6 md:p-8 space-y-6 mx-auto">
	<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
		<div class="flex flex-wrap items-center gap-4 flex-1">
			<!-- Type Filter -->
			<Select.Root type="single" bind:value={selectedType}>
				<Select.Trigger class="w-[180px] bg-background border-border">
					Type: {selectedType === 'All' ? 'All' : selectedType}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="All" label="All">All</Select.Item>
						<Select.Item value="VAN" label="Van">Van</Select.Item>
						<Select.Item value="TRUCK" label="Truck">Truck</Select.Item>
						<Select.Item value="MINI" label="Mini">Mini</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root>

			<!-- Status Filter -->
			<Select.Root type="single" bind:value={selectedStatus}>
				<Select.Trigger class="w-[180px] bg-background border-border">
					Status: {selectedStatus === 'All' ? 'All' : selectedStatus.replace('_', ' ')}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="All" label="All">All</Select.Item>
						<Select.Item value="AVAILABLE" label="Available">Available</Select.Item>
						<Select.Item value="ON_TRIP" label="On Trip">On Trip</Select.Item>
						<Select.Item value="IN_SHOP" label="In Shop">In Shop</Select.Item>
						<Select.Item value="RETIRED" label="Retired">Retired</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root>

			<!-- Search -->
			<div class="relative w-full max-w-sm">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search reg. no..."
					bind:value={searchQuery}
					class="pl-9 bg-background border-border"
				/>
			</div>
		</div>

		<!-- Add Vehicle Button -->
		<Button>
			<Plus />
			Add Vehicle
		</Button>
	</div>

	<!-- Table -->
	<div class="rounded-md border bg-card overflow-hidden">
		<Table.Root>
			<Table.Header>
				<Table.Row class="hover:bg-transparent">
					<Table.Head class="w-[200px] text-xs font-semibold tracking-wider text-muted-foreground"
						>REG. NO. (UNIQUE)</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground"
						>NAME/MODEL</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground"
						>TYPE</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground"
						>CAPACITY</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground"
						>ODOMETER</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground"
						>ACQ. COST</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground"
						>STATUS</Table.Head
					>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filteredVehicles as vehicle (vehicle.id)}
					<Table.Row class="group">
						<Table.Cell class="font-medium font-mono text-sm">{vehicle.regNo}</Table.Cell>
						<Table.Cell>{vehicle.name}</Table.Cell>
						<Table.Cell class="capitalize">{vehicle.type.toLowerCase()}</Table.Cell>
						<Table.Cell>{formatCapacity(vehicle.capacityKg)}</Table.Cell>
						<Table.Cell>{formatCurrency(vehicle.odometerKm)}</Table.Cell>
						<Table.Cell>{formatCurrency(vehicle.acquisitionCost)}</Table.Cell>
						<Table.Cell>
							{#if vehicle.status === 'AVAILABLE'}
								<Badge
									variant="default"
									class="bg-emerald-500 hover:bg-emerald-600 border-0 shadow-none font-normal px-2.5 py-0.5 rounded-md"
									>Available</Badge
								>
							{:else if vehicle.status === 'ON_TRIP'}
								<Badge
									variant="default"
									class="bg-blue-500 hover:bg-blue-600 border-0 shadow-none font-normal px-2.5 py-0.5 rounded-md text-white"
									>On Trip</Badge
								>
							{:else if vehicle.status === 'IN_SHOP'}
								<Badge
									variant="default"
									class="bg-amber-600 hover:bg-amber-700 border-0 shadow-none font-normal px-2.5 py-0.5 rounded-md text-white"
									>In Shop</Badge
								>
							{:else if vehicle.status === 'RETIRED'}
								<Badge
									variant="default"
									class="bg-red-400 hover:bg-red-500 border-0 shadow-none font-normal px-2.5 py-0.5 rounded-md text-white"
									>Retired</Badge
								>
							{/if}
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={7} class="h-24 text-center">No vehicles found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Rule Footer -->
	<p class="text-sm font-medium text-amber-600 dark:text-amber-500 mt-2">
		Rule: Registration No. must be unique - Retired/In Shop vehicles are hidden from Trip Dispatcher
	</p>
</div>
