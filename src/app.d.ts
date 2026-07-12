import type { User, Session } from 'better-auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: User;
			session?: Session;
			employee?: typeof import('$lib/server/db/schema').employee.$inferSelect | null;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
