import { getRequestEvent } from '$app/server';
import { createAuthClient } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';
import { sveltekitCookies } from 'better-auth/svelte-kit';

export const authClient = createAuthClient({
	plugins: [adminClient(), sveltekitCookies(getRequestEvent)]
});
