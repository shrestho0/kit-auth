// import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OAUTH_REDIRECT } from "$env/static/private";
// import { AuthProvidersUtility, RefreshTokenUtility, UsersUtility, generateGoogleAuthUrl, handleGoogeAuthSubmission, updateOAuthCredentials } from "$lib/utils/auth-utils.server";
// import { returnFailClientError, returnFailServerError } from "$lib/utils/error-utils.server";
// import { comparePassword, generateAuthTokens, setAuthCookies } from "$lib/utils/utils.server";
// import { userLoginSchema } from "$lib/validations/auth-validation";
// import type { OauthCredentials } from "@prisma/client";
// import { fail, type Actions, redirect } from "@sveltejs/kit";
// import type { PageServerLoad } from "./$types";

import { google } from "googleapis";
import type { PageServerLoad } from "./$types";
import { redirect, type Actions, type Action, fail } from "@sveltejs/kit";
import type { OauthCredentials } from "@prisma/client";
import { userLoginSchema } from "$lib/auth/validation";
import { AuthProvidersUtility, RefreshTokenUtility, UserDeviceUtility, UsersUtility } from "$lib/auth/utils/db.server";
import { returnFailClientError, returnFailServerError } from "$lib/auth/utils/errors.server";
import { comparePassword, generateAuthTokens } from "$lib/auth/utils/common.server";
import { TokensUtility } from "$lib/auth/utils/tokens.server";
import prisma from "$lib/server/db/prisma";

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user_id && locals.user_username) {
        return redirect(307, "/");
    }
};

export const actions: Actions = {
    password: handlePasswordAuthSubmission(),

    // google: handleGoogeAuthSubmission(),
};


function handlePasswordAuthSubmission(): Action {
    return async ({ request, locals, cookies }) => {


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
        const passProvider = await AuthProvidersUtility.getProviderByEmailAndName(validatedData.data.email, "password", true);
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

        // console.log("password is valid");

        const deviceToken = TokensUtility.getDeviceToken(cookies);

        if (!deviceToken) returnFailClientError(400, {
            // Make the page reload or invalidate all
            message: "Device token not found. Cookie issue. Reload the page"
        });




        // get user devices

        // check if device exists with [userId, deviceToken]

        // if yes, delete that device

        // create a new one device 



        // create a new refresh token 
        const authTokens = TokensUtility.generateAuthTokens({
            username: passProvider?.user?.username as string,
            id: passProvider?.user?.id as string,
        });

        // if RefreshToken/Device exists, delete it
        // find by userId and deviceToken

        const cleanedOldDeviceAndRefeshToken = await UserDeviceUtility.deleteByUserAndDeviceToken(passProvider.user.id as string, deviceToken as string);
        console.log("Cleaned old device and refresh token", structuredClone(cleanedOldDeviceAndRefeshToken));


        // create a new user device
        const refreshAndDeviceData = {
            userId: passProvider?.user?.id,
            refreshToken: authTokens.refreshToken,
            UserDevice: {
                create: {
                    userId: passProvider?.user?.id,
                    deviceToken: deviceToken ?? "",
                    deviceDataJson: `{"todo": "not implemented"}`,
                }
            }
        }
        const refreshTokenAndUserDevice = await RefreshTokenUtility.create(refreshAndDeviceData);


        //  
        if (!refreshTokenAndUserDevice) return returnFailServerError(500, {
            message: "Failed to create refresh token and user device"
        });


        console.log(`User:`, structuredClone(passProvider?.user), `logged in with refresh token:`, structuredClone(refreshTokenAndUserDevice));

        // set auth cookies
        TokensUtility.ensureAuthTokenCookie(cookies, authTokens, "password");

        return redirect(307, "/");

    }
}