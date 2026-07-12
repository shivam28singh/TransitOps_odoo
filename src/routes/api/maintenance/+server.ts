import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { maintenance, vehicle } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const CreateMaintenanceSchema = z.object({
	vehicleId: z.number(),
	serviceType: z.string().min(1, 'Service type is required'),
	cost: z.number().min(0, 'Cost must be positive'),
	date: z.string(),
	status: z.enum(['ACTIVE', 'COMPLETED']).default('ACTIVE')
});

export const POST: RequestHandler = async (event) => {
	const { locals, request } = event;
	if (!locals.user || !locals.employee) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const role = locals.employee.role;
	// Only certain roles can create maintenance records
	if (role !== 'ADMIN' && role !== 'FLEET_MANAGER') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const parsedData = CreateMaintenanceSchema.parse(body);

		const result = await db.transaction(async (tx) => {
			// Check if vehicle exists
			const selectedVehicle = await tx.query.vehicle.findFirst({
				where: eq(vehicle.id, parsedData.vehicleId)
			});
			if (!selectedVehicle) {
				throw new Error('Selected vehicle not found.');
			}

			// Create Maintenance record
			const [newRecord] = await tx
				.insert(maintenance)
				.values({
					vehicleId: parsedData.vehicleId,
					serviceType: parsedData.serviceType,
					cost: parsedData.cost.toString(),
					date: new Date(parsedData.date),
					status: parsedData.status
				})
				.returning();

			// If active, update vehicle status to IN_SHOP
			if (parsedData.status === 'ACTIVE') {
				await tx
					.update(vehicle)
					.set({ status: 'IN_SHOP' })
					.where(eq(vehicle.id, parsedData.vehicleId));
			}

			return newRecord;
		});

		return json({ success: true, record: result });
	} catch (e: any) {
		if (e instanceof z.ZodError) {
			return json({ error: e.issues[0]?.message || 'Invalid input data' }, { status: 400 });
		}
		return json({ error: e.message || 'Failed to create maintenance record.' }, { status: 500 });
	}
};
