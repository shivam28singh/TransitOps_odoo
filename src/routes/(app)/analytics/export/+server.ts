import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { trip, fuelLog, maintenance, vehicle } from '$lib/server/db/schema';
import { sql, sum, countDistinct, gte } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		// Calculate overall Fuel Efficiency
		const [distanceResult] = await db.select({ total: sum(trip.distanceKm) }).from(trip);
		const [fuelResult] = await db
			.select({
				totalLiters: sum(fuelLog.liters),
				totalCost: sum(fuelLog.cost)
			})
			.from(fuelLog);

		const totalDistance = Number(distanceResult?.total || 0);
		const totalLiters = Number(fuelResult?.totalLiters || 0);
		const totalFuelCost = Number(fuelResult?.totalCost || 0);

		const fuelEfficiency = totalLiters > 0 ? (totalDistance / totalLiters).toFixed(1) : '0.0';

		// Calculate Fleet Utilization
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const [activeVehiclesResult] = await db
			.select({ count: countDistinct(trip.vehicleId) })
			.from(trip)
			.where(gte(trip.createdAt, thirtyDaysAgo));

		const [totalVehiclesResult] = await db.select({ count: sql<number>`count(*)` }).from(vehicle);

		const activeVehicles = Number(activeVehiclesResult?.count || 0);
		const totalVehicles = Number(totalVehiclesResult?.count || 0);

		const fleetUtilization =
			totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

		// Calculate Operational Cost
		const [maintenanceResult] = await db.select({ total: sum(maintenance.cost) }).from(maintenance);
		const [tripCostsResult] = await db
			.select({
				totalToll: sum(trip.tollCost),
				totalOther: sum(trip.otherCost),
				totalRevenue: sum(trip.revenue)
			})
			.from(trip);

		const totalMaintenance = Number(maintenanceResult?.total || 0);
		const totalToll = Number(tripCostsResult?.totalToll || 0);
		const totalOther = Number(tripCostsResult?.totalOther || 0);
		const totalRevenue = Number(tripCostsResult?.totalRevenue || 0);

		const operationalCost = totalMaintenance + totalFuelCost + totalToll + totalOther;

		// Calculate Vehicle ROI
		const [acquisitionCostResult] = await db
			.select({ total: sum(vehicle.acquisitionCost) })
			.from(vehicle);
		const totalAcquisitionCost = Number(acquisitionCostResult?.total || 0);

		const vehicleRoi =
			totalAcquisitionCost > 0
				? (
						((totalRevenue - (totalMaintenance + totalFuelCost)) / totalAcquisitionCost) *
						100
					).toFixed(1)
				: '0.0';

		// Costliest Vehicles
		const costliestVehiclesResult = await db.execute(sql`
			WITH vehicle_costs AS (
				SELECT v.id, v.reg_no, v.name,
					COALESCE((SELECT SUM(cost) FROM maintenance WHERE vehicle_id = v.id), 0) as maintenance_cost,
					COALESCE((SELECT SUM(cost) FROM fuel_log WHERE vehicle_id = v.id), 0) as fuel_cost
				FROM vehicle v
			)
			SELECT 
				id,
				reg_no,
				name,
				(maintenance_cost + fuel_cost) as total_cost
			FROM vehicle_costs
			ORDER BY total_cost DESC
		`);

		// Build CSV content
		let csvContent = 'TransitOps Analytics Report\n\n';

		// Section 1: KPIs
		csvContent += 'Key Performance Indicators\n';
		csvContent += 'Metric,Value\n';
		csvContent += `Fuel Efficiency,${fuelEfficiency} km/l\n`;
		csvContent += `Fleet Utilization,${fleetUtilization}%\n`;
		csvContent += `Operational Cost,$${operationalCost.toLocaleString()}\n`;
		csvContent += `Vehicle ROI,${vehicleRoi}%\n\n`;

		// Section 2: Vehicles Costs
		csvContent += 'Vehicle Cost Breakdown\n';
		csvContent += 'Vehicle Name,Registration No,Total Cost ($)\n';
		costliestVehiclesResult.rows.forEach((row: any) => {
			csvContent += `"${row.name}","${row.reg_no}",${row.total_cost}\n`;
		});

		// Return the CSV file
		return new Response(csvContent, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': 'attachment; filename="transitops_analytics_report.csv"'
			}
		});
	} catch (err) {
		console.error('Error generating CSV export:', err);
		return new Response('Failed to generate report', { status: 500 });
	}
};
