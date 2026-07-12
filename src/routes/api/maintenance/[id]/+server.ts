import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { maintenance, vehicle } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const PUT: RequestHandler = async (event) => {
	const { locals, params } = event;
	if (!locals.user || !locals.employee) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const role = locals.employee.role;
	if (role !== 'ADMIN' && role !== 'FLEET_MANAGER') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		const maintenanceId = Number(params.id);
		if (isNaN(maintenanceId)) {
			return json({ error: 'Invalid maintenance ID' }, { status: 400 });
		}

		const result = await (async () => {
			const record = await db.query.maintenance.findFirst({
				where: eq(maintenance.id, maintenanceId)
			});
			if (!record) {
				throw new Error('Maintenance record not found');
			}
			if (record.status === 'COMPLETED') {
				throw new Error('Maintenance is already completed');
			}

			// Update maintenance status
			await db
				.update(maintenance)
				.set({ status: 'COMPLETED' })
				.where(eq(maintenance.id, maintenanceId));

			// Update vehicle status back to AVAILABLE
			await db.update(vehicle).set({ status: 'AVAILABLE' }).where(eq(vehicle.id, record.vehicleId));

			return { status: 'COMPLETED' };
		})();

		return json({ success: true, result });
	} catch (e: any) {
		return json({ error: e.message || 'Failed to complete maintenance' }, { status: 500 });
	}
};
