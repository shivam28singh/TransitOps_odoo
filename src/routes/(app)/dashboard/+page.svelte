<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import {
		Truck,
		CircleCheck,
		TriangleAlert,
		Map,
		Clock,
		Users,
		Percent,
		Search
	} from '@lucide/svelte';

	let { data } = $props();
	
	let employee = $derived(page.data.employee);
	let role = $derived(employee?.role || 'GUEST');

	// Role-based visibility flags
	let showActiveVehicles = $derived(['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'].includes(role));
	let showAvailableVehicles = $derived(['ADMIN', 'FLEET_MANAGER', 'DISPATCHER'].includes(role));
	let showInMaintenance = $derived(['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'].includes(role));
	let showActiveTrips = $derived(['ADMIN', 'DISPATCHER', 'SAFETY_OFFICER', 'DRIVER'].includes(role));
	let showPendingTrips = $derived(['ADMIN', 'DISPATCHER', 'DRIVER'].includes(role));
	let showDriversOnDuty = $derived(['ADMIN', 'DISPATCHER', 'SAFETY_OFFICER'].includes(role));
	let showFleetUtil = $derived(['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'].includes(role));

	let showRecentTrips = $derived(['ADMIN', 'DISPATCHER', 'SAFETY_OFFICER', 'DRIVER'].includes(role));
	let showVehicleStatus = $derived(['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'].includes(role));

	// Bindable filter states
	let selectedType = $derived(data.filters.selectedType);
	let selectedStatus = $derived(data.filters.selectedStatus);
	let selectedRegion = $derived(data.filters.selectedRegion);

	// Search query (client-side matching mock styling)
	let searchQuery = $state('');

	function updateFilters(type = selectedType, status = selectedStatus, region = selectedRegion) {
		const params = page.url.searchParams;
		params.set('vehicleType', type);
		params.set('status', status);
		params.set('region', region);
		goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	}
</script>

<div class="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto">
	<!-- Top Row: Search and Title (as in Mockup) -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div class="relative w-full max-w-sm">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search..."
				bind:value={searchQuery}
				class="pl-9 bg-card border-border"
			/>
		</div>
		<div class="text-right hidden md:block">
			<span class="text-sm font-medium"
				>{data.filters.selectedRegion !== 'All'
					? `Region: ${data.filters.selectedRegion}`
					: 'All Regions'}</span
			>
		</div>
	</div>

	<!-- Filters Section -->
	<div class="bg-card border border-border rounded-xl p-4 md:p-6 space-y-3 shadow-xs">
		<span class="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">Filters</span
		>
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<div class="flex flex-col gap-1.5">
				<label for="vehicle-type" class="text-xs text-muted-foreground">Vehicle Type</label>
				<Select.Root
					type="single"
					value={selectedType}
					onValueChange={(val) => val && updateFilters(val, selectedStatus, selectedRegion)}
				>
					<Select.Trigger
						class="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						{selectedType === 'All' ? 'All Types' : selectedType}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Vehicle Type</Select.GroupHeading>
							<Select.Item value="All">All Types</Select.Item>
							{#each data.filters.vehicleTypes as type, idx (idx)}
								<Select.Item value={type} label={type}>{type}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="status" class="text-xs text-muted-foreground">Status</label>
				<Select.Root
					type="single"
					value={selectedStatus}
					onValueChange={(val) => val && updateFilters(selectedType, val, selectedRegion)}
				>
					<Select.Trigger
						class="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						{selectedStatus === 'All' ? 'All Statuses' : selectedStatus}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Status</Select.GroupHeading>
							<Select.Item value="All">All Statuses</Select.Item>
							<Select.Item value="AVAILABLE">Available</Select.Item>
							<Select.Item value="ON_TRIP">On Trip</Select.Item>
							<Select.Item value="IN_SHOP">In Shop</Select.Item>
							<Select.Item value="RETIRED">Retired</Select.Item>
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="region" class="text-xs text-muted-foreground">Region</label>
				<Select.Root
					type="single"
					value={selectedRegion}
					onValueChange={(val) => val && updateFilters(selectedType, selectedStatus, val)}
				>
					<Select.Trigger
						class="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						{selectedRegion === 'All' ? 'All Regions' : selectedRegion}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.GroupHeading>Region</Select.GroupHeading>
							<Select.Item value="All">All Regions</Select.Item>
							{#each data.filters.regions as region, idx (idx)}
								<Select.Item value={region} label={region}>{region}</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	</div>

	<!-- KPI Metric Cards Grid (7 Cols as in Mockup) -->
	<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap gap-4">
		<!-- Active Vehicles -->
		{#if showActiveVehicles}
		<div
			class="flex-1 min-w-[150px] bg-card border-l-4 border-l-blue-500 border border-y-border border-r-border rounded-lg p-4 space-y-2 shadow-xs"
		>
			<div class="flex items-center justify-between text-muted-foreground">
				<span class="text-[10px] font-bold tracking-wider uppercase">Active Vehicles</span>
				<Truck class="size-4 text-blue-500" />
			</div>
			<div class="text-2xl font-bold tracking-tight">{data.kpis.activeVehicles}</div>
		</div>
		{/if}

		<!-- Available Vehicles -->
		{#if showAvailableVehicles}
		<div
			class="flex-1 min-w-[150px] bg-card border-l-4 border-l-emerald-500 border border-y-border border-r-border rounded-lg p-4 space-y-2 shadow-xs"
		>
			<div class="flex items-center justify-between text-muted-foreground">
				<span class="text-[10px] font-bold tracking-wider uppercase">Available Vehicles</span>
				<CircleCheck class="size-4 text-emerald-500" />
			</div>
			<div class="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
				{data.kpis.availableVehicles}
			</div>
		</div>
		{/if}

		<!-- Vehicles in Maintenance -->
		{#if showInMaintenance}
		<div
			class="flex-1 min-w-[150px] bg-card border-l-4 border-l-amber-500 border border-y-border border-r-border rounded-lg p-4 space-y-2 shadow-xs"
		>
			<div class="flex items-center justify-between text-muted-foreground">
				<span class="text-[10px] font-bold tracking-wider uppercase">In Maintenance</span>
				<TriangleAlert class="size-4 text-amber-500" />
			</div>
			<div class="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
				{data.kpis.inMaintenanceVehicles}
			</div>
		</div>
		{/if}

		<!-- Active Trips -->
		{#if showActiveTrips}
		<div
			class="flex-1 min-w-[150px] bg-card border-l-4 border-l-sky-500 border border-y-border border-r-border rounded-lg p-4 space-y-2 shadow-xs"
		>
			<div class="flex items-center justify-between text-muted-foreground">
				<span class="text-[10px] font-bold tracking-wider uppercase">Active Trips</span>
				<Map class="size-4 text-sky-500" />
			</div>
			<div class="text-2xl font-bold tracking-tight">{data.kpis.activeTrips}</div>
		</div>
		{/if}

		<!-- Pending Trips -->
		{#if showPendingTrips}
		<div
			class="flex-1 min-w-[150px] bg-card border-l-4 border-l-purple-500 border border-y-border border-r-border rounded-lg p-4 space-y-2 shadow-xs"
		>
			<div class="flex items-center justify-between text-muted-foreground">
				<span class="text-[10px] font-bold tracking-wider uppercase">Pending Trips</span>
				<Clock class="size-4 text-purple-500" />
			</div>
			<div class="text-2xl font-bold tracking-tight">{data.kpis.pendingTrips}</div>
		</div>
		{/if}

		<!-- Drivers On Duty -->
		{#if showDriversOnDuty}
		<div
			class="flex-1 min-w-[150px] bg-card border-l-4 border-l-indigo-500 border border-y-border border-r-border rounded-lg p-4 space-y-2 shadow-xs"
		>
			<div class="flex items-center justify-between text-muted-foreground">
				<span class="text-[10px] font-bold tracking-wider uppercase">Drivers On Duty</span>
				<Users class="size-4 text-indigo-500" />
			</div>
			<div class="text-2xl font-bold tracking-tight">{data.kpis.driversOnDuty}</div>
		</div>
		{/if}

		<!-- Fleet Utilization -->
		{#if showFleetUtil}
		<div
			class="flex-1 min-w-[150px] bg-card border-l-4 border-l-teal-500 border border-y-border border-r-border rounded-lg p-4 space-y-2 shadow-xs"
		>
			<div class="flex items-center justify-between text-muted-foreground">
				<span class="text-[10px] font-bold tracking-wider uppercase">Fleet Util.</span>
				<Percent class="size-4 text-teal-500" />
			</div>
			<div class="text-2xl font-bold tracking-tight text-teal-600 dark:text-teal-400">
				{data.kpis.fleetUtilization}%
			</div>
		</div>
		{/if}
	</div>

	<!-- Main Body layout (2 Columns) -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Left: Recent Trips Table -->
		{#if showRecentTrips}
		<div class="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-4 shadow-xs">
			<h2 class="text-lg font-semibold tracking-tight">Recent Trips</h2>
			<div class="border rounded-md">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Trip</Table.Head>
							<Table.Head>Vehicle</Table.Head>
							<Table.Head>Driver</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head class="text-right">Route</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.recentTrips as trip, idx (idx)}
							<Table.Row>
								<Table.Cell class="font-mono text-xs"
									>TR-{trip.id.toString().padStart(4, '0')}</Table.Cell
								>
								<Table.Cell>{trip.vehicleName}</Table.Cell>
								<Table.Cell>{trip.driverName}</Table.Cell>
								<Table.Cell>
									{#if trip.status === 'IN_PROGRESS'}
										<Badge
											variant="default"
											class="bg-blue-500 hover:bg-blue-600 text-white border-0">On Trip</Badge
										>
									{:else if trip.status === 'COMPLETED'}
										<Badge
											variant="default"
											class="bg-emerald-500 hover:bg-emerald-600 text-white border-0"
											>Completed</Badge
										>
									{:else if trip.status === 'SCHEDULED'}
										<Badge
											variant="secondary"
											class="bg-sky-400/20 hover:bg-sky-400/30 text-sky-700 dark:text-sky-300 border-0"
											>Dispatched</Badge
										>
									{:else}
										<Badge variant="outline" class="text-muted-foreground border-muted">Draft</Badge
										>
									{/if}
								</Table.Cell>
								<Table.Cell class="text-right text-xs text-muted-foreground truncate max-w-[150px]">
									{trip.startLocation} &rarr; {trip.endLocation}
								</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={5} class="h-24 text-center">No recent trips found.</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		</div>
		{/if}

		<!-- Right: Vehicle Status Progress Bars -->
		{#if showVehicleStatus}
		<div class="lg:col-span-1 bg-card border border-border rounded-xl p-6 space-y-6 shadow-xs">
			<h2 class="text-lg font-semibold tracking-tight">Vehicle Status</h2>
			<div class="space-y-4">
				{#if true}
					<!-- Available -->
					{@const avPercent =
						data.statusCounts.total > 0
							? (data.statusCounts.available / data.statusCounts.total) * 100
							: 0}
					<div class="space-y-1.5">
						<div class="flex justify-between text-xs font-medium">
							<span>Available</span>
							<span class="text-muted-foreground"
								>{data.statusCounts.available} ({Math.round(avPercent)}%)</span
							>
						</div>
						<div class="h-2 w-full bg-muted rounded-full overflow-hidden">
							<div class="h-full bg-emerald-500 rounded-full" style="width: {avPercent}%"></div>
						</div>
					</div>

					<!-- On Trip -->
					{@const tripPercent =
						data.statusCounts.total > 0
							? (data.statusCounts.onTrip / data.statusCounts.total) * 100
							: 0}
					<div class="space-y-1.5">
						<div class="flex justify-between text-xs font-medium">
							<span>On Trip</span>
							<span class="text-muted-foreground"
								>{data.statusCounts.onTrip} ({Math.round(tripPercent)}%)</span
							>
						</div>
						<div class="h-2 w-full bg-muted rounded-full overflow-hidden">
							<div class="h-full bg-blue-500 rounded-full" style="width: {tripPercent}%"></div>
						</div>
					</div>

					<!-- In Shop -->
					{@const shopPercent =
						data.statusCounts.total > 0
							? (data.statusCounts.inShop / data.statusCounts.total) * 100
							: 0}
					<div class="space-y-1.5">
						<div class="flex justify-between text-xs font-medium">
							<span>In Shop</span>
							<span class="text-muted-foreground"
								>{data.statusCounts.inShop} ({Math.round(shopPercent)}%)</span
							>
						</div>
						<div class="h-2 w-full bg-muted rounded-full overflow-hidden">
							<div class="h-full bg-amber-500 rounded-full" style="width: {shopPercent}%"></div>
						</div>
					</div>

					<!-- Retired -->
					{@const retiredPercent =
						data.statusCounts.total > 0
							? (data.statusCounts.retired / data.statusCounts.total) * 100
							: 0}
					<div class="space-y-1.5">
						<div class="flex justify-between text-xs font-medium">
							<span>Retired</span>
							<span class="text-muted-foreground"
								>{data.statusCounts.retired} ({Math.round(retiredPercent)}%)</span
							>
						</div>
						<div class="h-2 w-full bg-muted rounded-full overflow-hidden">
							<div class="h-full bg-red-500 rounded-full" style="width: {retiredPercent}%"></div>
						</div>
					</div>
				{/if}
			</div>
		</div>
		{/if}
	</div>
</div>
