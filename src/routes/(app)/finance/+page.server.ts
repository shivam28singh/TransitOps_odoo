import { db } from '$lib/server/db';
import { fuelLog, trip, vehicle, maintenance } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.employee) {
		throw redirect(302, '/signin');
	}

	const role = locals.employee.role;

	// Fetch all fuel logs
	const fuelLogs = await db
		.select({
			id: fuelLog.id,
			vehicleId: fuelLog.vehicleId,
			vehicleName: vehicle.name,
			vehicleRegNo: vehicle.regNo,
			date: fuelLog.date,
			liters: fuelLog.liters,
			cost: fuelLog.cost
		})
		.from(fuelLog)
		.innerJoin(vehicle, eq(fuelLog.vehicleId, vehicle.id))
		.orderBy(desc(fuelLog.date));

	// Fetch all trips for expense tracking
	const tripsList = await db
		.select({
			id: trip.id,
			vehicleId: trip.vehicleId,
			vehicleName: vehicle.name,
			vehicleRegNo: vehicle.regNo,
			tollCost: trip.tollCost,
			otherCost: trip.otherCost
		})
		.from(trip)
		.innerJoin(vehicle, eq(trip.vehicleId, vehicle.id))
		.orderBy(desc(trip.createdAt));

	// Calculate total maintenance cost per vehicle
	const maintenanceStats = await db
		.select({
			vehicleId: maintenance.vehicleId,
			totalCost: sql<number>`sum(${maintenance.cost})`
		})
		.from(maintenance)
		.groupBy(maintenance.vehicleId);

	const maintCostMap: Record<number, number> = {};
	let totalMaintenanceCost = 0;
	for (const stat of maintenanceStats) {
		const cost = Number(stat.totalCost || 0);
		maintCostMap[stat.vehicleId] = cost;
		totalMaintenanceCost += cost;
	}

	// Calculate overall total fuel cost
	let totalFuelCost = 0;
	for (const log of fuelLogs) {
		totalFuelCost += Number(log.cost || 0);
	}

	const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

	// Prepare vehicles list for dropdowns (excluding retired)
	const vehiclesList = await db
		.select({
			id: vehicle.id,
			name: vehicle.name,
			regNo: vehicle.regNo
		})
		.from(vehicle);

	return {
		fuelLogs,
		trips: tripsList.map(t => ({
			...t,
			maintLinked: maintCostMap[t.vehicleId] || 0
		})),
		vehicles: vehiclesList,
		totalOperationalCost,
		role
	};
};
