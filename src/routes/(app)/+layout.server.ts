import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/signin');
	}
	return {
		user: event.locals.user,
		employee: event.locals.employee
	};
};
