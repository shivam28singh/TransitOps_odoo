import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = (event) => {
	// If user is already logged in, redirect them
	if (event.locals.user) {
		return redirect(302, '/');
	}

	const token = event.url.searchParams.get('token');
	if (!token) {
		return redirect(302, '/signin');
	}

	return { token };
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirmPassword') as string;
		const token = formData.get('token') as string;

		if (!password || !confirmPassword || !token) {
			return fail(400, { error: 'All fields are required.' });
		}

		if (password !== confirmPassword) {
			return fail(400, { error: 'Passwords do not match.' });
		}

		try {
			await auth.api.resetPassword({
				body: {
					newPassword: password,
					token
				},
				headers: event.request.headers
			});
		} catch (err: any) {
			return fail(400, { error: err.message || 'Failed to reset password.' });
		}

		return redirect(302, '/signin');
	}
};
