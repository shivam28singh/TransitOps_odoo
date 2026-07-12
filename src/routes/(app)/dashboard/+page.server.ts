import { db } from '$lib/server/db';
import { vehicle, driver, employee, trip } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allVehicles = await db.select().from(vehicle);
	const driversData = await db.select().from(driver);
	const tripsData = await db.select().from(trip);

	// Query top 5 recent trips with joins for visualization
	const recentTripsRaw = await db
		.select({
			id: trip.id,
			status: trip.status,
			startTime: trip.startTime,
			startLocation: trip.startLocation,
			endLocation: trip.endLocation,
			vehicleName: vehicle.name,
			driverName: employee.fullName
		})
		.from(trip)
		.innerJoin(vehicle, eq(trip.vehicleId, vehicle.id))
		.innerJoin(driver, eq(trip.driverId, driver.id))
		.innerJoin(employee, eq(driver.employeeId, employee.id))
		.orderBy(sql`${trip.createdAt} DESC`)
		.limit(50);

	return {
		vehicles: allVehicles,
		drivers: driversData,
		trips: tripsData,
		recentTrips: recentTripsRaw
	};
};
