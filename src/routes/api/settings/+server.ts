import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { systemSettings } from '$lib/server/db/schema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const SettingsSchema = z.object({
	depotName: z.string().min(1, 'Depot name is required'),
	currency: z.string().min(1, 'Currency is required'),
	distanceUnit: z.string().min(1, 'Distance unit is required')
});

export const POST: RequestHandler = async (event) => {
	const { locals, request } = event;
	if (!locals.user || !locals.employee) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const role = locals.employee.role;
	// Only ADMIN can modify settings
	if (role !== 'ADMIN') {
		return json({ error: 'Forbidden. Only administrators can update system settings.' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const parsedData = SettingsSchema.parse(body);

		const existingSettings = await db.query.systemSettings.findFirst({
			where: eq(systemSettings.id, 1)
		});

		let record;
		if (existingSettings) {
			[record] = await db
				.update(systemSettings)
				.set({
					depotName: parsedData.depotName,
					currency: parsedData.currency,
					distanceUnit: parsedData.distanceUnit
				})
				.where(eq(systemSettings.id, 1))
				.returning();
		} else {
			[record] = await db
				.insert(systemSettings)
				.values({
					id: 1,
					depotName: parsedData.depotName,
					currency: parsedData.currency,
					distanceUnit: parsedData.distanceUnit
				})
				.returning();
		}

		return json({ success: true, settings: record });
	} catch (e: any) {
		if (e instanceof z.ZodError) {
			return json({ error: e.issues[0]?.message || 'Invalid input data' }, { status: 400 });
		}
		return json({ error: e.message || 'Failed to update settings.' }, { status: 500 });
	}
};
