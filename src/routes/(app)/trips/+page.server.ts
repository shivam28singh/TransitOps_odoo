import { db } from '$lib/server/db';
import { trip, vehicle, driver, employee } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.employee) {
		throw redirect(302, '/signin');
	}

	const role = locals.employee.role;

	// Fetch all trips for Live Board
	const trips = await db
		.select({
			id: trip.id,
			startLocation: trip.startLocation,
			endLocation: trip.endLocation,
			status: trip.status,
			vehicleName: vehicle.name,
			vehicleRegNo: vehicle.regNo,
			driverName: employee.fullName,
			distanceKm: trip.distanceKm,
			cargoWeightKg: trip.cargoWeightKg
		})
		.from(trip)
		.innerJoin(vehicle, eq(trip.vehicleId, vehicle.id))
		.innerJoin(driver, eq(trip.driverId, driver.id))
		.innerJoin(employee, eq(driver.employeeId, employee.id))
		.orderBy(desc(trip.createdAt));

	// Fetch available vehicles
	const availableVehicles = await db
		.select({
			id: vehicle.id,
			name: vehicle.name,
			regNo: vehicle.regNo,
			capacityKg: vehicle.capacityKg
		})
		.from(vehicle)
		.where(eq(vehicle.status, 'AVAILABLE'));

	// Fetch available drivers
	const availableDrivers = await db
		.select({
			id: driver.id,
			name: employee.fullName
		})
		.from(driver)
		.innerJoin(employee, eq(driver.employeeId, employee.id))
		.where(eq(driver.status, 'AVAILABLE'));

	return {
		trips,
		availableVehicles,
		availableDrivers,
		role
	};
};
