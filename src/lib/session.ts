import { writable, type Writable } from 'svelte/store';

export type User = {
	email?: string | null;
	displayName?: string | null;
	photoURL?: string | null;
	uid?: string | null;
	emailVerified?: boolean | null;
};

export type SessionState = {
	user: User | null;
	loading?: boolean;
	loggedIn?: boolean;
	apiToken?: string | null;
};

export const session = <Writable<SessionState>>writable();
