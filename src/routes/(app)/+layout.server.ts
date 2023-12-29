import { ServerSideCookieUtility } from "$lib/auth/utils/cookies.server";
import type { LayoutServerLoad } from "../$types";




export const load: LayoutServerLoad = async ({ cookies }) => {
    console.log("cookies", cookies.getAll());

    ServerSideCookieUtility.ensureNoAuthPageCookie(cookies);
}