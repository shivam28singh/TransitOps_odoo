import { db } from '$lib/server/db';
import { driver, employee, trip } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.employee) {
		throw redirect(302, '/signin');
	}

	const role = locals.employee.role;

	// Query all drivers joined with employee information
	const driversList = await db
		.select({
			id: driver.id,
			employeeId: driver.employeeId,
			fullName: employee.fullName,
			phone: employee.phone,
			avatar: employee.avatar,
			licenseNumber: driver.licenseNumber,
			licenseCategory: driver.licenseCategory,
			licenseExpiry: driver.licenseExpiry,
			safetyScore: driver.safetyScore,
			status: driver.status
		})
		.from(driver)
		.innerJoin(employee, eq(driver.employeeId, employee.id))
		.orderBy(employee.fullName);

	// Calculate dynamic trip completion rate per driver using SQL group-by
	const tripStats = await db
		.select({
			driverId: trip.driverId,
			total: sql<number>`count(${trip.id})`,
			completed: sql<number>`sum(case when ${trip.status} = 'COMPLETED' then 1 else 0 end)`
		})
		.from(trip)
		.groupBy(trip.driverId);

	// Map trip stats by driverId
	const tripStatsMap: Record<number, { completed: number; total: number }> = {};
	for (const stat of tripStats) {
		tripStatsMap[stat.driverId] = {
			completed: Number(stat.completed || 0),
			total: Number(stat.total || 0)
		};
	}

	// Assemble final list of drivers with their completion rate
	const drivers = driversList.map((d) => {
		const stats = tripStatsMap[d.id] || { completed: 0, total: 0 };
		const tripCompletion = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : null;

		return {
			...d,
			tripCompletion
		};
	});

	return {
		drivers,
		role
	};
};
