import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { trip } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const AddExpenseSchema = z.object({
	tollCost: z.number().min(0, 'Toll cost must be positive'),
	otherCost: z.number().min(0, 'Other cost must be positive')
});

export const PATCH: RequestHandler = async (event) => {
	const { locals, request, params } = event;
	if (!locals.user || !locals.employee) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const role = locals.employee.role;
	// Only certain roles can add expenses
	if (role !== 'ADMIN' && role !== 'FLEET_MANAGER' && role !== 'DISPATCHER' && role !== 'FINANCIAL_ANALYST') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const tripId = parseInt(params.id);
	if (isNaN(tripId)) {
		return json({ error: 'Invalid trip ID' }, { status: 400 });
	}

	try {
		const body = await request.json();
		const parsedData = AddExpenseSchema.parse(body);

		const [updatedTrip] = await db
			.update(trip)
			.set({
				tollCost: parsedData.tollCost.toString(),
				otherCost: parsedData.otherCost.toString()
			})
			.where(eq(trip.id, tripId))
			.returning();

		if (!updatedTrip) {
			return json({ error: 'Trip not found' }, { status: 404 });
		}

		return json({ success: true, trip: updatedTrip });
	} catch (e: any) {
		if (e instanceof z.ZodError) {
			return json({ error: e.issues[0]?.message || 'Invalid input data' }, { status: 400 });
		}
		return json({ error: e.message || 'Failed to add expense.' }, { status: 500 });
	}
};
