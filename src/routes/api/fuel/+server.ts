import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { fuelLog } from '$lib/server/db/schema';
import { z } from 'zod';

const AddFuelSchema = z.object({
	vehicleId: z.number(),
	liters: z.number().min(0, 'Liters must be positive'),
	cost: z.number().min(0, 'Cost must be positive'),
	date: z.string()
});

export const POST: RequestHandler = async (event) => {
	const { locals, request } = event;
	if (!locals.user || !locals.employee) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const role = locals.employee.role;
	// Only certain roles can add fuel logs
	if (
		role !== 'ADMIN' &&
		role !== 'FLEET_MANAGER' &&
		role !== 'DISPATCHER' &&
		role !== 'FINANCIAL_ANALYST'
	) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const parsedData = AddFuelSchema.parse(body);

		const [newLog] = await db
			.insert(fuelLog)
			.values({
				vehicleId: parsedData.vehicleId,
				liters: parsedData.liters.toString(),
				cost: parsedData.cost.toString(),
				date: new Date(parsedData.date)
			})
			.returning();

		return json({ success: true, log: newLog });
	} catch (e: any) {
		if (e instanceof z.ZodError) {
			return json({ error: e.issues[0]?.message || 'Invalid input data' }, { status: 400 });
		}
		return json({ error: e.message || 'Failed to add fuel log.' }, { status: 500 });
	}
};
