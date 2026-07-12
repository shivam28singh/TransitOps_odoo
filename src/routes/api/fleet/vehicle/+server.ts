import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { vehicle } from '$lib/server/db/schema';
import { z } from 'zod';

const AddVehicleSchema = z.object({
	regNo: z.string().min(1, 'Registration Number is required'),
	name: z.string().min(1, 'Name/Model is required'),
	type: z.enum(['VAN', 'TRUCK', 'MINI']),
	capacityKg: z.preprocess((val) => Number(val), z.number().positive('Capacity must be positive')),
	odometerKm: z.preprocess(
		(val) => Number(val),
		z.number().nonnegative('Odometer must be non-negative')
	),
	acquisitionCost: z.preprocess(
		(val) => Number(val),
		z.number().positive('Acquisition Cost must be positive')
	),
	region: z.string().optional()
});

export const POST: RequestHandler = async (event) => {
	const { locals, request } = event;
	if (!locals.user || !locals.employee) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const role = locals.employee.role;
	if (role !== 'ADMIN' && role !== 'FLEET_MANAGER') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const parsedData = AddVehicleSchema.parse(body);

		// Insert into DB
		const [newVehicle] = await db
			.insert(vehicle)
			.values({
				regNo: parsedData.regNo,
				name: parsedData.name,
				type: parsedData.type,
				capacityKg: parsedData.capacityKg.toString(),
				odometerKm: parsedData.odometerKm.toString(),
				acquisitionCost: parsedData.acquisitionCost.toString(),
				region: parsedData.region || null,
				status: 'AVAILABLE'
			})
			.returning();

		return json({ success: true, vehicle: newVehicle });
	} catch (e: any) {
		if (e instanceof z.ZodError) {
			return json({ error: e.issues[0]?.message || 'Invalid input data' }, { status: 400 });
		}
		if (e.message?.includes('unique') || e.code === '23505') {
			return json({ error: 'Registration Number must be unique.' }, { status: 400 });
		}
		return json({ error: e.message || 'Failed to insert vehicle.' }, { status: 500 });
	}
};
