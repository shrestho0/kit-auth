// See https://kit.svelte.dev/docs/types#app

import type { PrismaClient } from "@prisma/client";

drizzle
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			prisma: PrismaClient;
			user_id: string | null;
			user_username: string | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };
