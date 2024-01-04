import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ServerSideCookieUtility } from "$lib/auth/utils/cookies.server";
import { OauthActionHelper } from "$lib/auth/helpers/oauth.server";




export const load: PageServerLoad = async ({ locals, cookies }) => {
    if (locals.user_id && locals.user_username) {
        return redirect(307, "/");
    }

    await ServerSideCookieUtility.ensureRegisterPageCookieAsync(cookies);
};


export const actions: Actions = {
    password: OauthActionHelper.handlePasswordRegisterSubmission(),
    google: OauthActionHelper.handleGoogleAuthSubmission(),
};
