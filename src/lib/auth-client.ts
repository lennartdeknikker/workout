import { createAuthClient } from 'better-auth/svelte';

/** Same-origin auth client (baseURL defaults to the current origin). */
export const authClient = createAuthClient();
