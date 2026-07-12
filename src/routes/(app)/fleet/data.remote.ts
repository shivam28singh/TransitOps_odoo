import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { vehicle } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
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

export const addVehicle = form(AddVehicleSchema, async (parsedData) => {
	const event = getRequestEvent();
	if (!event?.locals.user || !event?.locals.employee) {
		throw error(401, 'Unauthorized');
	}

	const role = event.locals.employee.role;
	if (role !== 'ADMIN' && role !== 'FLEET_MANAGER') {
		throw error(403, 'Forbidden');
	}

	try {
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

		return { success: true, vehicle: newVehicle };
	} catch (e: any) {
		if (e.message?.includes('unique') || e.code === '23505') {
			throw error(400, 'Registration Number must be unique.');
		}
		throw error(500, e.message || 'Failed to insert vehicle.');
	}
});
