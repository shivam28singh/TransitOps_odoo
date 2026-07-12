import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { employee, driver, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const AddDriverSchema = z.object({
	fullName: z.string().min(1, 'Full Name is required'),
	email: z.string().email('Invalid email address'),
	phone: z.string().min(10, 'Contact Number must be at least 10 digits'),
	licenseNumber: z.string().min(1, 'License Number is required'),
	licenseCategory: z.string().min(1, 'License Category is required'),
	licenseExpiry: z.string().min(1, 'License Expiry Date is required'),
	safetyScore: z.preprocess(
		(val) => (val === '' || val === null ? 100 : Number(val)),
		z
			.number()
			.min(0, 'Safety Score must be at least 0')
			.max(100, 'Safety Score cannot exceed 100')
			.default(100)
	),
	status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).default('AVAILABLE')
});

const UpdateDriverStatusSchema = z.object({
	driverId: z.number(),
	status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'])
});

export const POST: RequestHandler = async (event) => {
	const { locals, request } = event;
	if (!locals.user || !locals.employee) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const role = locals.employee.role;
	if (role !== 'ADMIN' && role !== 'DISPATCHER' && role !== 'SAFETY_OFFICER') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const parsedData = AddDriverSchema.parse(body);

		// Execute in a transaction to guarantee data integrity across user, employee, and driver
		const result = await db.transaction(async (tx) => {
			// Check if email already exists
			const existingUser = await tx.query.user.findFirst({
				where: eq(user.email, parsedData.email)
			});
			if (existingUser) {
				throw new Error('Email address is already in use.');
			}

			const userId = crypto.randomUUID();

			// 1. Create User
			await tx.insert(user).values({
				id: userId,
				name: parsedData.fullName,
				email: parsedData.email,
				emailVerified: false
			});

			// 2. Create Employee
			const [newEmployee] = await tx
				.insert(employee)
				.values({
					userId: userId,
					fullName: parsedData.fullName,
					phone: parsedData.phone,
					role: 'DRIVER',
					status: 'ACTIVE'
				})
				.returning();

			// 3. Create Driver
			const [newDriver] = await tx
				.insert(driver)
				.values({
					employeeId: newEmployee.id,
					licenseNumber: parsedData.licenseNumber,
					licenseCategory: parsedData.licenseCategory,
					licenseExpiry: new Date(parsedData.licenseExpiry),
					safetyScore: parsedData.safetyScore.toString(),
					status: parsedData.status
				})
				.returning();

			return { ...newDriver, fullName: newEmployee.fullName, phone: newEmployee.phone };
		});

		return json({ success: true, driver: result });
	} catch (e: any) {
		if (e instanceof z.ZodError) {
			return json({ error: e.issues[0]?.message || 'Invalid input data' }, { status: 400 });
		}
		if (e.message?.includes('unique') || e.code === '23505') {
			if (e.message?.includes('email')) {
				return json({ error: 'Email address is already in use.' }, { status: 400 });
			}
			return json({ error: 'License Number or Email is already registered.' }, { status: 400 });
		}
		return json({ error: e.message || 'Failed to create driver profile.' }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async (event) => {
	const { locals, request } = event;
	if (!locals.user || !locals.employee) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const role = locals.employee.role;
	if (role !== 'ADMIN' && role !== 'DISPATCHER' && role !== 'SAFETY_OFFICER') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		const body = await request.json();
		const parsedData = UpdateDriverStatusSchema.parse(body);

		const [updated] = await db
			.update(driver)
			.set({ status: parsedData.status })
			.where(eq(driver.id, parsedData.driverId))
			.returning();

		return json({ success: true, driver: updated });
	} catch (e: any) {
		if (e instanceof z.ZodError) {
			return json({ error: e.issues[0]?.message || 'Invalid inputs' }, { status: 400 });
		}
		return json({ error: e.message || 'Failed to update driver status.' }, { status: 500 });
	}
};
