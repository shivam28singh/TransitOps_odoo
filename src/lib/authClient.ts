import { PUBLIC_ORIGIN } from '$env/static/public';
import { sentinelClient } from '@better-auth/infra/client';
import { createAuthClient } from 'better-auth/client';
import { adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
	baseURL: PUBLIC_ORIGIN,

	plugins: [sentinelClient(), adminClient()]
});
