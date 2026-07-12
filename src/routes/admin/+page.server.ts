import { db } from '$lib/server/db';
import { employee, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Fetch all employees joined with users to get their email addresses
	const employees = await db
		.select({
			id: employee.id,
			userId: employee.userId,
			fullName: employee.fullName,
			role: employee.role,
			status: employee.status,
			email: user.email,
			createdAt: employee.createdAt
		})
		.from(employee)
		.innerJoin(user, eq(employee.userId, user.id))
		.orderBy(employee.createdAt);

	return {
		employees
	};
};

export const actions: Actions = {
	updateRole: async ({ request, locals }) => {
		// Just a double-check even though hooks.server.ts guards the route
		if (!locals.employee || locals.employee.role !== 'ADMIN') {
			return fail(403, { error: 'Forbidden: Admin access required.' });
		}

		const data = await request.formData();
		const employeeId = data.get('employeeId') as string;
		const newRole = data.get('role') as string;

		if (!employeeId || !newRole) {
			return fail(400, { error: 'Employee ID and Role are required.' });
		}

		try {
			await db
				.update(employee)
				.set({ role: newRole as any })
				.where(eq(employee.id, parseInt(employeeId)));

			return { success: true };
		} catch (error) {
			console.error('Error updating role:', error);
			return fail(500, { error: 'Failed to update employee role.' });
		}
	}
};
