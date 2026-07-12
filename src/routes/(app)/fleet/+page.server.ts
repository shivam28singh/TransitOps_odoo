import { db } from '$lib/server/db';
import { vehicle } from '$lib/server/db/schema';
import { and, notInArray } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.employee) {
		throw redirect(302, '/signin');
	}

	const role = locals.employee.role;

	const conditions = [];

	if (role === 'DISPATCHER') {
		conditions.push(notInArray(vehicle.status, ['IN_SHOP', 'RETIRED']));
	}

	const vehicles = await db
		.select()
		.from(vehicle)
		.where(conditions.length > 0 ? and(...conditions) : undefined)
		.orderBy(vehicle.regNo);

	return {
		vehicles,
		role
	};
};
