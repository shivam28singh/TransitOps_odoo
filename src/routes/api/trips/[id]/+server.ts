import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { trip, vehicle, driver, fuelLog } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const UpdateTripSchema = z.object({
	status: z.enum(['COMPLETED', 'CANCELLED']),
	odometerKm: z.number().min(0).optional(),
	fuelLiters: z.number().min(0).optional(),
	fuelCost: z.number().min(0).optional()
});

export const PUT: RequestHandler = async (event) => {
	const { locals, request, params } = event;
	if (!locals.user || !locals.employee) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const role = locals.employee.role;
	if (role !== 'ADMIN' && role !== 'DISPATCHER' && role !== 'FLEET_MANAGER') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		const tripId = Number(params.id);
		if (isNaN(tripId)) {
			return json({ error: 'Invalid trip ID' }, { status: 400 });
		}

		const body = await request.json();
		const parsedData = UpdateTripSchema.parse(body);

		const result = await db.transaction(async (tx) => {
			// Fetch the trip
			const currentTrip = await tx.query.trip.findFirst({
				where: eq(trip.id, tripId)
			});
			if (!currentTrip) {
				throw new Error('Trip not found');
			}
			if (currentTrip.status === 'COMPLETED' || currentTrip.status === 'CANCELLED') {
				throw new Error('Trip is already completed or cancelled.');
			}

			// Complete workflow
			if (parsedData.status === 'COMPLETED') {
				// 1. Update Trip
				await tx
					.update(trip)
					.set({
						status: 'COMPLETED',
						endTime: new Date()
					})
					.where(eq(trip.id, tripId));

				// 2. Update Vehicle Odometer
				if (parsedData.odometerKm !== undefined) {
					await tx
						.update(vehicle)
						.set({
							odometerKm: parsedData.odometerKm.toString(),
							status: 'AVAILABLE'
						})
						.where(eq(vehicle.id, currentTrip.vehicleId));
				} else {
					await tx
						.update(vehicle)
						.set({ status: 'AVAILABLE' })
						.where(eq(vehicle.id, currentTrip.vehicleId));
				}

				// 3. Log Fuel if provided
				if (
					parsedData.fuelLiters !== undefined &&
					parsedData.fuelCost !== undefined &&
					parsedData.fuelLiters > 0
				) {
					await tx.insert(fuelLog).values({
						vehicleId: currentTrip.vehicleId,
						liters: parsedData.fuelLiters.toString(),
						cost: parsedData.fuelCost.toString(),
						date: new Date()
					});
				}

				// 4. Update Driver
				await tx
					.update(driver)
					.set({ status: 'AVAILABLE' })
					.where(eq(driver.id, currentTrip.driverId));
			}
			// Cancel workflow
			else if (parsedData.status === 'CANCELLED') {
				await tx.update(trip).set({ status: 'CANCELLED' }).where(eq(trip.id, tripId));

				await tx
					.update(vehicle)
					.set({ status: 'AVAILABLE' })
					.where(eq(vehicle.id, currentTrip.vehicleId));

				await tx
					.update(driver)
					.set({ status: 'AVAILABLE' })
					.where(eq(driver.id, currentTrip.driverId));
			}

			return { status: parsedData.status };
		});

		return json({ success: true, result });
	} catch (e: any) {
		if (e instanceof z.ZodError) {
			return json({ error: e.issues[0]?.message || 'Invalid input data' }, { status: 400 });
		}
		return json({ error: e.message || 'Failed to update trip.' }, { status: 500 });
	}
};
