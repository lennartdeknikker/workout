// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-pwa/client" />
import type { Auth } from '$lib/server/auth';

type Session = Auth['$Infer']['Session'];

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: Session['user'] | null;
			session: Session['session'] | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
