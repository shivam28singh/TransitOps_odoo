<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Select from '$lib/components/ui/select';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Search, Plus, TriangleAlert } from '@lucide/svelte';
	import AddDriverDialog, { openAddDriver } from '$lib/components/custom/dialog/addDriver.svelte';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	// Derived lists and values
	let drivers = $derived([...data.drivers]);
	let role = $derived(data.role);
	let canModify = $derived(['ADMIN', 'DISPATCHER', 'SAFETY_OFFICER'].includes(role));

	// Search and filter state
	let searchQuery = $state('');
	let selectedStatusFilter = $state('All');

	// Active driver selection for status toggling
	let selectedDriverId = $state<number | null>(null);

	// Client-side filtering logic
	let filteredDrivers = $derived(
		drivers.filter((d) => {
			if (selectedStatusFilter !== 'All' && d.status !== selectedStatusFilter) return false;

			if (searchQuery.trim() !== '') {
				const query = searchQuery.trim().toLowerCase();
				const nameMatch = d.fullName.toLowerCase().includes(query);
				const licenseMatch = d.licenseNumber?.toLowerCase().includes(query) || false;
				if (!nameMatch && !licenseMatch) return false;
			}
			return true;
		})
	);

	// Get currently selected driver
	let selectedDriver = $derived(drivers.find((d) => d.id === selectedDriverId) || null);

	// Helpers
	const formatExpiry = (dateVal: string | Date | null) => {
		if (!dateVal) return 'N/A';
		const date = new Date(dateVal);
		if (isNaN(date.getTime())) return 'N/A';
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const year = date.getFullYear();
		return `${month}/${year}`;
	};

	const isLicenseExpired = (dateVal: string | Date | null) => {
		if (!dateVal) return false;
		const date = new Date(dateVal);
		if (isNaN(date.getTime())) return false;

		// Reset time parts to check date-only expiry
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return date < today;
	};

	const handleAddDriver = () => {
		openAddDriver(async () => {
			await invalidateAll();
		});
	};

	const handleRowClick = (id: number) => {
		if (selectedDriverId === id) {
			selectedDriverId = null; // deselect
		} else {
			selectedDriverId = id;
		}
	};

	// Update status using PATCH API
	async function updateDriverStatus(newStatus: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED') {
		if (!selectedDriverId) return;
		try {
			const res = await fetch('/api/drivers', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					driverId: selectedDriverId,
					status: newStatus
				})
			});
			const resData = await res.json();
			if (!res.ok) {
				toast.error(resData.error || 'Failed to update driver status');
				return;
			}
			toast.success('Driver status updated successfully');
			await invalidateAll();
		} catch (error: any) {
			toast.error(error.message || 'An error occurred while updating status');
		}
	}
</script>

<AddDriverDialog />

<div class="p-6 md:p-8 space-y-6 mx-auto w-full max-w-7xl">
	<!-- Top Bar -->
	<div class="flex flex-col sm:flex-row items-center justify-between gap-4">
		<div class="flex flex-wrap items-center gap-4 flex-1 w-full sm:w-auto">
			<!-- Status Filter -->
			<Select.Root type="single" bind:value={selectedStatusFilter}>
				<Select.Trigger class="w-[180px] bg-background border-border">
					Status: {selectedStatusFilter === 'All' ? 'All' : selectedStatusFilter.replace('_', ' ')}
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						<Select.Item value="All" label="All">All</Select.Item>
						<Select.Item value="AVAILABLE" label="Available">Available</Select.Item>
						<Select.Item value="ON_TRIP" label="On Trip">On Trip</Select.Item>
						<Select.Item value="OFF_DUTY" label="Off Duty">Off Duty</Select.Item>
						<Select.Item value="SUSPENDED" label="Suspended">Suspended</Select.Item>
					</Select.Group>
				</Select.Content>
			</Select.Root>

			<!-- Search -->
			<div class="relative w-full max-w-sm">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search name or license..."
					bind:value={searchQuery}
					class="pl-9 bg-background border-border"
				/>
			</div>
		</div>

		<!-- Add Driver Button -->
		{#if canModify}
			<Button onclick={handleAddDriver} class="w-full sm:w-auto">
				<Plus class="size-4 mr-2" />
				Add Driver
			</Button>
		{/if}
	</div>

	<!-- Drivers Table -->
	<div class="rounded-md border bg-card overflow-hidden">
		<Table.Root>
			<Table.Header>
				<Table.Row class="hover:bg-transparent">
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground"
						>DRIVER</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground"
						>LICENSE NO.</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground"
						>CATEGORY</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground"
						>EXPIRY</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground"
						>CONTACT</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground text-center"
						>TRIP COMPL.</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground text-center"
						>SAFETY</Table.Head
					>
					<Table.Head class="text-xs font-semibold tracking-wider text-muted-foreground"
						>STATUS</Table.Head
					>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each filteredDrivers as driver (driver.id)}
					{@const expired = isLicenseExpired(driver.licenseExpiry)}
					<Table.Row
						onclick={() => handleRowClick(driver.id)}
						class="group cursor-pointer transition-colors {selectedDriverId === driver.id
							? 'bg-muted/70 hover:bg-muted/80'
							: 'hover:bg-muted/30'}"
					>
						<Table.Cell>
							<div class="flex items-center gap-3">
								<Avatar.Root class="size-8">
									<Avatar.Fallback class="bg-primary/10 text-primary text-xs font-medium">
										{driver.fullName
											.split(' ')
											.map((n: string) => n[0])
											.join('')
											.toUpperCase()
											.slice(0, 2)}
									</Avatar.Fallback>
								</Avatar.Root>
								<div>
									<div class="font-medium text-sm text-foreground">{driver.fullName}</div>
								</div>
							</div>
						</Table.Cell>
						<Table.Cell class="font-mono text-sm">{driver.licenseNumber || '—'}</Table.Cell>
						<Table.Cell class="text-sm font-semibold">{driver.licenseCategory || '—'}</Table.Cell>
						<Table.Cell>
							<div
								class="flex items-center gap-1.5 text-sm {expired
									? 'text-destructive font-semibold'
									: ''}"
							>
								{formatExpiry(driver.licenseExpiry)}
								{#if expired}
									<Badge
										variant="destructive"
										class="px-1 py-0 text-[10px] uppercase font-bold shrink-0">Expired</Badge
									>
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell class="text-sm text-muted-foreground font-mono"
							>{driver.phone || '—'}</Table.Cell
						>
						<Table.Cell class="text-sm text-center font-semibold">
							{#if driver.tripCompletion !== null}
								{driver.tripCompletion}%
							{:else}
								<span class="text-muted-foreground/50">—</span>
							{/if}
						</Table.Cell>
						<Table.Cell class="text-center">
							<Badge
								variant="outline"
								class="font-mono font-semibold text-xs border-emerald-500/20 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400"
							>
								{driver.safetyScore}%
							</Badge>
						</Table.Cell>
						<Table.Cell>
							{#if driver.status === 'AVAILABLE'}
								<Badge
									variant="default"
									class="bg-emerald-500 hover:bg-emerald-600 border-0 shadow-none font-normal px-2.5 py-0.5 rounded-md text-white"
									>Available</Badge
								>
							{:else if driver.status === 'ON_TRIP'}
								<Badge
									variant="default"
									class="bg-blue-500 hover:bg-blue-600 border-0 shadow-none font-normal px-2.5 py-0.5 rounded-md text-white"
									>On Trip</Badge
								>
							{:else if driver.status === 'OFF_DUTY'}
								<Badge
									variant="default"
									class="bg-zinc-500 hover:bg-zinc-600 border-0 shadow-none font-normal px-2.5 py-0.5 rounded-md text-white"
									>Off Duty</Badge
								>
							{:else if driver.status === 'SUSPENDED'}
								<Badge
									variant="default"
									class="bg-orange-500 hover:bg-orange-600 border-0 shadow-none font-normal px-2.5 py-0.5 rounded-md text-white"
									>Suspended</Badge
								>
							{/if}
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={8} class="h-24 text-center text-muted-foreground"
							>No drivers found.</Table.Cell
						>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<!-- Toggle Status & Rules Area -->
	<div class="flex flex-col gap-4 border border-border bg-card p-5 rounded-lg">
		<div class="flex flex-col gap-2">
			<span class="text-xs font-semibold text-muted-foreground tracking-wider uppercase"
				>Toggle Status</span
			>
			<div class="flex flex-wrap gap-2.5 items-center">
				<Button
					variant="outline"
					size="sm"
					disabled={!selectedDriverId || !canModify}
					onclick={() => updateDriverStatus('AVAILABLE')}
					class="border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-medium px-4 py-1.5 h-auto text-xs rounded-md {selectedDriver?.status ===
					'AVAILABLE'
						? 'bg-emerald-500/20 font-bold border-2'
						: ''}"
				>
					Available
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={!selectedDriverId || !canModify}
					onclick={() => updateDriverStatus('ON_TRIP')}
					class="border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-medium px-4 py-1.5 h-auto text-xs rounded-md {selectedDriver?.status ===
					'ON_TRIP'
						? 'bg-blue-500/20 font-bold border-2'
						: ''}"
				>
					On Trip
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={!selectedDriverId || !canModify}
					onclick={() => updateDriverStatus('OFF_DUTY')}
					class="border-zinc-500 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-500/10 font-medium px-4 py-1.5 h-auto text-xs rounded-md {selectedDriver?.status ===
					'OFF_DUTY'
						? 'bg-zinc-500/20 font-bold border-2'
						: ''}"
				>
					Off Duty
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={!selectedDriverId || !canModify}
					onclick={() => updateDriverStatus('SUSPENDED')}
					class="border-orange-500 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 font-medium px-4 py-1.5 h-auto text-xs rounded-md {selectedDriver?.status ===
					'SUSPENDED'
						? 'bg-orange-500/20 font-bold border-2'
						: ''}"
				>
					Suspended
				</Button>

				{#if !selectedDriverId}
					<span class="text-xs text-muted-foreground italic ml-2"
						>Select a driver from the table to toggle status.</span
					>
				{:else if !canModify}
					<span class="text-xs text-destructive italic ml-2"
						>You do not have permission to modify status.</span
					>
				{/if}
			</div>
		</div>

		<!-- Warning Banner -->
		<div
			class="flex items-start gap-2.5 text-sm font-semibold text-amber-600 dark:text-amber-500 mt-2"
		>
			<TriangleAlert class="size-4 shrink-0 mt-0.5" />
			<span>Rule: Expired license or Suspended status &rarr; blocked from trip assignment</span>
		</div>
	</div>
</div>
