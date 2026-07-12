import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

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
			await auth.api.signUpEmail({
				body: {
					name,
					email,
					password,
					role
				} as any,
				headers: event.request.headers
			});
		} catch (err: any) {
			return fail(400, { error: err.message || 'Failed to sign up.' });
		}

		return { success: true };
	}
};
