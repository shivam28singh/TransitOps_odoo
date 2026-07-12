import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { trip, vehicle, driver } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const CreateTripSchema = z.object({
	source: z.string().min(1, 'Source is required'),
	destination: z.string().min(1, 'Destination is required'),
	vehicleId: z.number(),
	driverId: z.number(),
	cargoWeightKg: z.number().min(0),
	distanceKm: z.number().min(0),
	status: z.enum(['DRAFT', 'DISPATCHED'])
});

export const POST: RequestHandler = async (event) => {
	const { locals, request } = event;
	if (!locals.user || !locals.employee) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const role = locals.employee.role;
	if (role !== 'ADMIN' && role !== 'DISPATCHER' && role !== 'FLEET_MANAGER') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const parsedData = CreateTripSchema.parse(body);

		const result = async () => {
			// Check vehicle
			const selectedVehicle = await db.query.vehicle.findFirst({
				where: eq(vehicle.id, parsedData.vehicleId)
			});
			if (!selectedVehicle || selectedVehicle.status !== 'AVAILABLE') {
				throw new Error('Selected vehicle is not available.');
			}
			if (Number(selectedVehicle.capacityKg) < parsedData.cargoWeightKg) {
				throw new Error('Cargo weight exceeds vehicle capacity.');
			}

			// Check driver
			const selectedDriver = await db.query.driver.findFirst({
				where: eq(driver.id, parsedData.driverId)
			});
			if (!selectedDriver || selectedDriver.status !== 'AVAILABLE') {
				throw new Error('Selected driver is not available.');
			}
			if (selectedDriver.licenseExpiry && new Date(selectedDriver.licenseExpiry) < new Date()) {
				throw new Error('Driver license is expired.');
			}

			// Create Trip
			const [newTrip] = await db
				.insert(trip)
				.values({
					vehicleId: parsedData.vehicleId,
					driverId: parsedData.driverId,
					startLocation: parsedData.source,
					endLocation: parsedData.destination,
					cargoWeightKg: parsedData.cargoWeightKg.toString(),
					distanceKm: parsedData.distanceKm.toString(),
					status: parsedData.status
				})
				.returning();

			// If dispatched immediately, update vehicle and driver statuses
			if (parsedData.status === 'DISPATCHED') {
				await db
					.update(vehicle)
					.set({ status: 'ON_TRIP' })
					.where(eq(vehicle.id, parsedData.vehicleId));
				await db
					.update(driver)
					.set({ status: 'ON_TRIP' })
					.where(eq(driver.id, parsedData.driverId));
			}

			return newTrip;
		};

		return json({ success: true, trip: result });
	} catch (e: any) {
		if (e instanceof z.ZodError) {
			return json({ error: e.issues[0]?.message || 'Invalid input data' }, { status: 400 });
		}
		return json({ error: e.message || 'Failed to create trip.' }, { status: 500 });
	}
};
