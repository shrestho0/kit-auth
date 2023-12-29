import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OAUTH_REDIRECT } from "$env/static/private";
import { AuthProvidersUtility, RefreshTokenUtility, UsersUtility, generateGoogleAuthUrl, handleGoogleAuthSubmission, updateOAuthCredentials } from "$lib/utils/auth-utils.server";
import { returnFailClientError, returnFailServerError } from "$lib/utils/error-utils.server";
import { comparePassword, generateAuthTokens, setAuthCookies } from "$lib/utils/utils.server";
import { userLoginSchema } from "$lib/validations/auth-validation";
import type { OauthCredentials } from "@prisma/client";
import { fail, type Actions, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

import { google } from "googleapis";

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user_id && locals.user_username) {
        return redirect(307, "/");
    }
};

export const actions: Actions = {
    password: async ({ request, locals, cookies }) => {

        const regData = Object.fromEntries(await request.formData());

        let userAuthProviders: OauthCredentials[] | undefined = undefined;


        // Check if user exists with that username or email

        const validatedData = userLoginSchema.safeParse(regData);
        if (!validatedData.success) {
            return fail(400, {
                success: false,
                errors: structuredClone(validatedData.error.errors)
            })
        }

        // check if user exists with the provider,providerEmail
        const passProvider = await AuthProvidersUtility.getProviderByEmailAndName(validatedData.data.email, "password");
        let errors = []

        // if exists
        if (!passProvider) {
            errors.push({ path: ["email"], message: "No user found with email" });
            return returnFailClientError(404, errors)
        }

        // check password
        const passValid = await comparePassword(validatedData.data.password, passProvider.passwordHash as string);
        if (!passValid) {
            errors.push({ path: ["password"], message: "Password is incorrect" });
            return returnFailClientError(400, errors)
        }

        console.log("password is valid");

        // get user by id
        const theUser = await UsersUtility.get(passProvider.userId);
        if (!theUser) return returnFailServerError();

        const tokens = await generateAuthTokens({
            id: theUser.id,
            username: theUser.username

        });

        const whileLoginToken = await AuthProvidersUtility.update(passProvider.id, {
            refreshToken: tokens.refreshToken
        });
        console.log("WhileLoginToken", whileLoginToken);

        await setAuthCookies(cookies, tokens, "password");

        return redirect(307, "/");

    },

    google: handleGoogleAuthSubmission(),
};


