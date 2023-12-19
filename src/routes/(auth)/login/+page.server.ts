import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES, OAUTH_REDIRECT } from "$env/static/private";
import prisma from "$lib/server/prisma";
import { createOAuthCredentials, generateGoogleAuthUrl, updateOAuthCredentials } from "$lib/utils/auth-utils.server";
import { returnFailClientError, returnFailServerError } from "$lib/utils/error-utils.server";
import { convertNumberSuffixToSecond } from "$lib/utils/utils.common";
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

        // ekhane safe
        try {
            const user = await prisma.user.findUnique({
                where: {
                    email: validatedData.data.email
                }, include: {
                    oauthCredentials: true
                }

            },)
            if (user) {
                console.log("user found", user);
                // check password
                if (await comparePassword(validatedData.data.password, user.passwordHash as string)) {

                    locals.user_id = user.id;
                    locals.user_username = user.username;
                    userAuthProviders = user.oauthCredentials;

                } else {

                    return returnFailClientError(400, [
                        {
                            path: ["password"],
                            message: "Password is incorrect"
                        }
                    ])
                }
            } else {

                return returnFailClientError(404, [
                    {
                        path: ["email"],
                        message: "User not found"
                    }
                ])
            }

        } catch (e) {
            console.log("error", e);

            return returnFailServerError();
        }


        // jodi shob thik thake

        if (locals.user_id && locals.user_username) {


            // create jwt token
            const tokens: Tokens = await generateAuthTokens({
                id: locals.user_id as string,
                username: locals.user_username as string
            });



            // find appropiate OauthCredential provider for user 

            const provider = "password";
            userAuthProviders?.forEach(async (oProvider: OauthCredentials) => {
                if (oProvider?.provider === "password") {
                    await updateOAuthCredentials(oProvider.id, {

                        refreshToken: tokens.refreshToken,
                    } as OauthCredentials);
                }
                // set amra regiter er time ee kore felsi ekhon update korlei hobe;
            })
            // update refresh token
            // set cookies
            await setAuthCookies(cookies, tokens, provider);


            return redirect(307, "/");


        } else return returnFailServerError();
    },

    google: async ({ request, locals, cookies, url }) => {
        const provider = "google";
        const siteUrl = url.origin;
        console.log(GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            siteUrl + OAUTH_REDIRECT + `/?provider=${provider}`
            , "request hobe");

        const authUrl = await generateGoogleAuthUrl(siteUrl);
        // return redirect(307, authorizationUrl);
        return {
            success: true,
            authUrl
        }
    }
};