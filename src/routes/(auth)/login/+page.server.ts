

import type { PageServerLoad } from "./$types";
import { redirect, type Actions } from "@sveltejs/kit";

import { OauthActionHelper } from "$auth/helpers/oauth.server";
import { ServerSideCookieUtility } from "$lib/auth/utils/cookies.server";

export const load: PageServerLoad = async ({ locals, cookies }) => {
    if (locals.user_id && locals.user_username) {
        return redirect(307, "/");
    }

    await ServerSideCookieUtility.ensureLoginPageCookieAsync(cookies);
};

export const actions: Actions = {
    password: OauthActionHelper.handlePasswordLoginSubmission(),
    google: OauthActionHelper.handleGoogleAuthSubmission(),
};


