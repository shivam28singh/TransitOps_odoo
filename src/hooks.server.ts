import { error, redirect, type Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { db } from '$lib/server/db';
import { employee } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;

		const emp = await db.query.employee.findFirst({
			where: eq(employee.userId, session.user.id)
		});
		event.locals.employee = emp ?? null;
	} else {
		event.locals.employee = null;
	}

	const path = event.url.pathname;

	// Basic authorization mapping
	const guards: Record<string, string[]> = {
		'/admin': ['ADMIN'],
		'/fleet': ['ADMIN', 'FLEET_MANAGER'],
		'/finance': ['ADMIN', 'FINANCIAL_ANALYST'],
		'/safety': ['ADMIN', 'SAFETY_OFFICER']
	};

	for (const [route, allowedRoles] of Object.entries(guards)) {
		if (path.startsWith(route)) {
			if (!event.locals.employee) {
				return redirect(302, '/signin');
			}
			if (!allowedRoles.includes(event.locals.employee.role)) {
				return error(403, 'Forbidden');
			}
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
