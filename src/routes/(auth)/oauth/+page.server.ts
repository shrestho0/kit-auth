import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { OauthActionHelper } from "$lib/auth/helpers/oauth.server";



export const load: PageServerLoad = async ({ locals }) => {
    return redirect(307, "/");
}

export const actions = {
    google: OauthActionHelper.handleGoogleAuthSubmission(),
}