import { db } from '$lib/server/db';
import { systemSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || !locals.employee) {
		throw redirect(302, '/signin');
	}

	const role = locals.employee.role;

	const settings = await db.query.systemSettings.findFirst({
		where: eq(systemSettings.id, 1)
	});

	return {
		settings: settings || {
			depotName: 'Gandhinagar Depot GJ4',
			currency: 'INR (Rs)',
			distanceUnit: 'Kilometers'
		},
		role
	};
};
