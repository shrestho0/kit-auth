import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OAUTH_REDIRECT } from "$env/static/private";
import { redirect, type Actions, type Action, fail, type Cookies } from "@sveltejs/kit";
import { google } from "googleapis";
import { TokensUtility } from "$auth/utils/tokens.server";
import { returnFailClientError, returnFailServerError } from "$auth/utils/errors.server";
import { userLoginSchema } from "../validation";
import { AuthProvidersUtility, RefreshTokenUtility, UserDeviceUtility } from "$auth/utils/db.server";
import { comparePassword, pasrseUserDataFromGoogleIdToken } from "$auth/utils/common.server";
import { OAUTH_CALLBACK_ACTIONS, OAUTH_CALLBACK_RESPONSES } from "$auth/enums";
import { ServerSideCookieUtility } from "../utils/cookies.server";



export class OauthActionHelper {

    static handlePasswordLoginSubmission(): Action {
        return async ({ request, locals, cookies }) => {

            const regData = Object.fromEntries(await request.formData());

            /* Check if device token is okay */
            const deviceToken = TokensUtility.validateDeviceTokenCookie(cookies);
            if (!deviceToken) return returnFailClientError(400, {
                // Make the page reload or invalidate all
                message: "Device token not found. Cookie issue. Reload the page"
            });


            /* Check if user exists with that username or email */

            const validatedData = userLoginSchema.safeParse(regData);
            if (!validatedData.success) {
                return fail(400, {
                    success: false,
                    errors: structuredClone(validatedData.error.errors)
                })
            }

            /* check if user exists with the provider,providerEmail */

            const passProvider = await AuthProvidersUtility.getProviderByEmailAndName(validatedData.data.email, "password", true);
            let errors = []

            /* return error if not  exists */

            if (!passProvider) {
                errors.push({ path: ["email"], message: "No user found with email" });
                return returnFailClientError(404, errors)
            }

            /* user exists here, check for password */

            const passValid = await comparePassword(validatedData.data.password, passProvider.passwordHash as string);
            if (!passValid) {
                errors.push({ path: ["password"], message: "Password is incorrect" });
                return returnFailClientError(400, errors)
            }



            // create a new refresh token 
            const authTokens = TokensUtility.generateAuthTokens({
                username: passProvider?.user?.username as string,
                id: passProvider?.user?.id as string,
            });



            const cleanedOldDeviceAndRefeshToken = await UserDeviceUtility.deleteIfExistsByUserAndDeviceToken(passProvider.user.id as string, deviceToken as string);
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


            if (!refreshTokenAndUserDevice) return returnFailServerError(500, {
                message: "Failed to create refresh token and user device"
            });


            console.log(`User:`, structuredClone(passProvider?.user), `logged in with refresh token:`, structuredClone(refreshTokenAndUserDevice));

            // set auth cookies
            TokensUtility.ensureAuthTokenCookie(cookies, authTokens, "password");

            return redirect(307, "/");

        }
    }


    static handleGoogleAuthSubmission(): Action {
        return async ({ request, locals, cookies, url }) => {
            const provider = "google";
            const siteUrl = url.origin;
            console.log(GOOGLE_CLIENT_ID,
                GOOGLE_CLIENT_SECRET,
                siteUrl + OAUTH_REDIRECT + `/?provider=${provider}`,
                "request hobe");

            const authUrl = await GoogleOauthHelpers.generateGoogleAuthUrl(siteUrl);
            // return redirect(307, authorizationUrl);
            return {
                success: true,
                authUrl
            };
        };
    }

    /**
     * 
     * @param userEmail string
     * @param userLoggedIn boolean
     * @param thePageRequestedFrom OauthPageRequestedFromPage
     * @returns OAUTH_CALLBACK_ACTIONS
     */
    static async getOauthActionAndResponseType(provider: oAuthProviders, userEmail: string, userLoggedIn: boolean, thePageRequestedFrom: OauthPageRequestedFromPage): Promise<{ OAUTH_CALLBACK_RESPONSE: OAUTH_CALLBACK_RESPONSES, OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS }> {
        console.log("thePage", thePageRequestedFrom);

        // if (userLoggedIn && thePageRequestedFrom === "link") {
        //     return OAUTH_CALLBACK_ACTIONS.LINK;
        // }

        if (userLoggedIn) {
            return {
                OAUTH_CALLBACK_RESPONSE: OAUTH_CALLBACK_RESPONSES.SUCCESS_REDIRECT,
                OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS.LINK,
            }
        }


        /**
         * Speggetti code
         */
        const userExistsWithProvider = await AuthProvidersUtility.getProviderByEmailAndName(userEmail, provider, true);

        const userExistsWithOtherProvider = await AuthProvidersUtility.getByProviderEmail(userEmail);
        console.log("userExistsWithProvider", userExistsWithProvider);
        console.log("userExistsWithOtherProvider", userExistsWithOtherProvider);

        if (userExistsWithProvider) {
            return {
                OAUTH_CALLBACK_RESPONSE: OAUTH_CALLBACK_RESPONSES.SUCCESS_REDIRECT,
                OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS.LOGIN,
            };
        }

        if (userExistsWithOtherProvider) {
            return {
                OAUTH_CALLBACK_RESPONSE: OAUTH_CALLBACK_RESPONSES.CONFIRM,
                OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS.MERGE,
            }
        }

        // new user here
        if (thePageRequestedFrom === "register") {
            return {
                OAUTH_CALLBACK_RESPONSE: OAUTH_CALLBACK_RESPONSES.SUCCESS_REDIRECT,
                OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS.REGISTER,

            }
        }
        if (thePageRequestedFrom === "login") {
            return {
                OAUTH_CALLBACK_RESPONSE: OAUTH_CALLBACK_RESPONSES.CONFIRM,
                OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS.REGISTER,
            }
        }

        return {
            OAUTH_CALLBACK_RESPONSE: OAUTH_CALLBACK_RESPONSES.SHOW_ERROR,
            OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS.NONE,
        }

    }




}

export class GoogleOauthHelpers {

    static async generateGoogleAuthUrl(siteUrl: string) {
        const oauth2Client = await GoogleOauthHelpers.getGoogleOauth2Client(siteUrl);
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ];

        return oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            /** Pass in the scopes array defined above.
              * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
            scope: scopes,
            // Enable incremental authorization. Recommended as a best practice.
            // include_granted_scopes: true
        });
    }

    static async getGoogleOauth2Client(siteUrl: string) {
        const provider = "google"
        return new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            siteUrl + OAUTH_REDIRECT + `/?provider=${provider}`
        );
    }

}