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

	let requiredModule: 'fleet' | 'driver' | 'trip' | 'fuel_exp' | 'analytics' | 'admin' | null =
		null;

	if (path.startsWith('/settings') || path.startsWith('/api/settings')) requiredModule = 'admin';
	else if (
		path.startsWith('/fleet') ||
		path.startsWith('/api/fleet') ||
		path.startsWith('/maintenance') ||
		path.startsWith('/api/maintenance')
	)
		requiredModule = 'fleet';
	else if (path.startsWith('/drivers') || path.startsWith('/api/drivers'))
		requiredModule = 'driver';
	else if (path.startsWith('/trips') || path.startsWith('/api/trips')) {
		if (path.includes('/expense')) requiredModule = 'fuel_exp';
		else requiredModule = 'trip';
	} else if (path.startsWith('/finance') || path.startsWith('/api/fuel'))
		requiredModule = 'fuel_exp';
	else if (path.startsWith('/analytics') || path.startsWith('/api/analytics'))
		requiredModule = 'analytics';

	if (requiredModule) {
		if (!event.locals.employee) {
			return redirect(302, '/signin');
		}

		const role = event.locals.employee.role;

		if (role !== 'ADMIN') {
			if (requiredModule === 'admin') {
				return error(403, 'Forbidden');
			}

			const isModify = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(event.request.method);

			const rbacMatrix: Record<string, Record<string, 'modify' | 'view' | 'none'>> = {
				fleet: {
					FLEET_MANAGER: 'modify',
					DISPATCHER: 'view',
					SAFETY_OFFICER: 'none',
					FINANCIAL_ANALYST: 'view'
				},
				driver: {
					FLEET_MANAGER: 'modify',
					DISPATCHER: 'none',
					SAFETY_OFFICER: 'modify',
					FINANCIAL_ANALYST: 'none'
				},
				trip: {
					FLEET_MANAGER: 'none',
					DISPATCHER: 'modify',
					SAFETY_OFFICER: 'view',
					FINANCIAL_ANALYST: 'none'
				},
				fuel_exp: {
					FLEET_MANAGER: 'none',
					DISPATCHER: 'none',
					SAFETY_OFFICER: 'none',
					FINANCIAL_ANALYST: 'modify'
				},
				analytics: {
					FLEET_MANAGER: 'modify',
					DISPATCHER: 'none',
					SAFETY_OFFICER: 'none',
					FINANCIAL_ANALYST: 'modify'
				}
			};

			const accessLevel = rbacMatrix[requiredModule]?.[role] || 'none';

			if (accessLevel === 'none') {
				return error(403, 'Forbidden');
			}
			if (accessLevel === 'view' && isModify) {
				return error(403, 'Forbidden');
			}
		}
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
