<script lang="ts">
	import { Download, Search } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { page } from '$app/state';

	let { data } = $props();

	// KPI Data mapped from server
	let kpis = $derived([
		{
			title: 'FUEL EFFICIENCY',
			value: data.fuelEfficiency,
			color: 'border-l-blue-500'
		},
		{
			title: 'FLEET UTILIZATION',
			value: data.fleetUtilization,
			color: 'border-l-green-500'
		},
		{
			title: 'OPERATIONAL COST',
			value: data.operationalCost,
			color: 'border-l-orange-500'
		},
		{
			title: 'VEHICLE ROI',
			value: data.vehicleRoi,
			color: 'border-l-green-500'
		}
	]);

	// Extract maximums for charting scales
	let maxRevenue = $derived(
		Math.max(...data.monthlyRevenue.map((d: any) => d.revenue), 1)
	);
	let maxCost = $derived(
		Math.max(...data.topCostliestVehicles.map((v: any) => v.cost), 1)
	);
	
	// Use colors from the mockup for the horizontal bars
	const vehicleColors = ['bg-red-400', 'bg-orange-500', 'bg-blue-400'];
</script>

<div class="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto text-slate-100 min-h-screen font-sans">
	
	<!-- Top Bar simulating mockup -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div class="relative w-full max-w-sm">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
			<Input
				placeholder="Search..."
				class="pl-9 bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-slate-600 rounded-lg"
			/>
		</div>
		<div class="flex items-center gap-4 ml-auto">
			<Button variant="outline" size="sm" class="border-slate-700 hover:bg-slate-800 text-slate-200" href="/analytics/export" data-sveltekit-preload-data="off">
				<Download class="size-4 mr-2" />
				Export CSV
			</Button>
		</div>
	</div>

	<!-- KPIs Grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
		{#each kpis as kpi}
			<div class="bg-[#111111] border border-slate-800 rounded-md p-5 flex flex-col justify-between border-l-[3px] {kpi.color} shadow-lg shadow-black/50 hover:shadow-black/70 transition-shadow">
				<h3 class="text-[10px] font-bold text-slate-400 tracking-wider mb-2 font-mono uppercase">
					{kpi.title}
				</h3>
				<p class="text-3xl font-light text-slate-100 tracking-tight" style="font-family: 'Inter', sans-serif;">
					{kpi.value}
				</p>
			</div>
		{/each}
	</div>
	
	<p class="text-xs text-slate-500 font-mono">
		ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
	</p>

	<!-- Charts Section -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
		
		<!-- Monthly Revenue -->
		<div class="space-y-6">
			<h3 class="text-sm font-bold text-slate-400 tracking-wider uppercase font-mono">
				Monthly Revenue
			</h3>
			
			<div class="h-48 flex items-end justify-between gap-1 sm:gap-2 border-b border-slate-800 pb-2">
				{#each data.monthlyRevenue as point}
					<div class="flex flex-col items-center justify-end h-full w-full group relative">
						<!-- Tooltip -->
						<div class="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-slate-200 text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
							${point.revenue.toLocaleString()}
						</div>
						
						<!-- Bar -->
						<div 
							class="w-full bg-[#5d8dbb] rounded-t-sm hover:bg-[#6c9cc8] transition-colors shadow-inner"
							style="height: {(point.revenue / maxRevenue) * 100}%"
						></div>
					</div>
				{/each}
			</div>
			
			<!-- X-Axis Labels -->
			<div class="flex justify-between px-1">
				{#each data.monthlyRevenue as point}
					<span class="text-[10px] text-slate-500 font-mono w-full text-center hidden sm:block truncate">
						{point.name}
					</span>
				{/each}
			</div>
		</div>

		<!-- Top Costliest Vehicles -->
		<div class="space-y-6">
			<h3 class="text-sm font-bold text-slate-400 tracking-wider uppercase font-mono">
				Top Costliest Vehicles
			</h3>
			
			<div class="space-y-5 pt-2">
				{#each data.topCostliestVehicles as vehicle, i}
					<div class="flex items-center gap-4">
						<span class="w-20 text-xs text-slate-400 font-mono truncate uppercase">
							{vehicle.name}
						</span>
						
						<div class="flex-1 h-3 bg-slate-800/50 rounded-r-sm relative overflow-hidden group">
							<div 
								class="h-full rounded-r-sm shadow-inner transition-all duration-500 {vehicleColors[i % vehicleColors.length]}"
								style="width: {(vehicle.cost / maxCost) * 100}%"
							></div>
							
							<!-- Hover Tooltip -->
							<div class="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center px-3 text-[10px] font-mono text-white/90 drop-shadow-md bg-black/20 pointer-events-none transition-opacity">
								${vehicle.cost.toLocaleString()}
							</div>
						</div>
					</div>
				{/each}
				
				{#if data.topCostliestVehicles.length === 0}
					<div class="text-slate-500 text-sm font-mono h-24 flex items-center justify-center border border-dashed border-slate-800 rounded">
						No vehicle cost data available.
					</div>
				{/if}
			</div>
		</div>

	</div>
</div>
