import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { employee } from '$lib/server/db/schema';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const role = formData.get('role') as string;
		if (!name || !email || !password || !role) {
			return fail(400, { error: 'Name, email, password, and role are required.' });
		}

		try {
			const { user, error } = await auth.api.signUpEmail({
				body: {
					name,
					email,
					password
				},
				headers: event.request.headers
			});
			if (user) {
				await db.insert(employee).values({
					userId: user.id,
					fullName: user.name,
					role: role as
						| 'ADMIN'
						| 'FLEET_MANAGER'
						| 'DISPATCHER'
						| 'SAFETY_OFFICER'
						| 'FINANCIAL_ANALYST'
						| 'DRIVER'
				});
			}
		} catch (err: any) {
			return fail(400, { error: err.message || 'Failed to sign up.' });
		}

		return { success: true };
	}
};
