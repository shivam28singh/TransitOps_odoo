import { db } from '$lib/server/db';
import { maintenance, vehicle } from '$lib/server/db/schema';
import { eq, desc, ne } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.employee) {
		throw redirect(302, '/signin');
	}

	const role = locals.employee.role;

	// Fetch all maintenance logs for the Service Log table
	const maintenanceLogs = await db
		.select({
			id: maintenance.id,
			vehicleRegNo: vehicle.regNo,
			vehicleName: vehicle.name,
			serviceType: maintenance.serviceType,
			cost: maintenance.cost,
			date: maintenance.date,
			status: maintenance.status
		})
		.from(maintenance)
		.innerJoin(vehicle, eq(maintenance.vehicleId, vehicle.id))
		.orderBy(desc(maintenance.createdAt));

	// Fetch vehicles for the dropdown (exclude retired vehicles)
	const vehiclesList = await db
		.select({
			id: vehicle.id,
			name: vehicle.name,
			regNo: vehicle.regNo,
			status: vehicle.status
		})
		.from(vehicle)
		.where(ne(vehicle.status, 'RETIRED'));

	return {
		maintenanceLogs,
		vehicles: vehiclesList,
		role
	};
};
