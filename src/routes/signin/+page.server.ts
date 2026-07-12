import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { ORIGIN } from '$env/static/private';

export const load: PageServerLoad = (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		if (!email || !password) {
			return fail(400, { error: 'Email and password are required.' });
		}

		try {
			const res = await auth.api.signInEmail({
				body: {
					email,
					password
				},
				headers: event.request.headers
			});
		} catch (err: any) {
			return fail(400, { error: err.message || 'Invalid credentials.' });
		}

		return redirect(302, '/');
	},

	forgotPassword: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email') as string;

		if (!email) {
			return fail(400, { error: 'Please enter your email.' });
		}

		try {
			await auth.api.requestPasswordReset({
				body: {
					email,
					redirectTo: `${ORIGIN}/reset-password`
				},
				headers: event.request.headers
			});
			return { success: true };
		} catch (err: any) {
			return fail(400, { error: err.message || 'Failed to send password reset email.' });
		}
	}
};
