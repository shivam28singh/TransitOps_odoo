import { env } from '$env/dynamic/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { employee } from '$lib/server/db/schema';
import { sendEmailVerificationEmail, sendPasswordResetEmail } from './email';

export const auth = betterAuth({
	appName: 'TransitOps',
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await db.insert(employee).values({
						userId: user.id,
						fullName: user.name,
						role: 'DRIVER',
						status: 'ACTIVE'
					});
				}
			}
		}
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await sendPasswordResetEmail(user.email, user.name, url);
		},
		onPasswordReset: async ({ user }) => {
			console.log(`Password for user ${user.email} has been reset.`);
		}
	},
	emailVerification: {
		sendVerificationEmail: async ({ user, url }) => {
			sendEmailVerificationEmail(user.email, user.name, url);
		},
		sendOnSignUp: true,
		autoSignInAfterVerification: true
	},
	rateLimit: {
		enabled: true,
		window: 30,
		max: 100,
		storage: 'secondary-storage',
		modelName: 'rateLimit'
	},
	advanced: {
		cookiePrefix: 'transit-ops',
		ipAddress: {
			ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for']
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
