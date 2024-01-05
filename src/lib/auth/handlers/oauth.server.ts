import { redirect, type Cookies } from "@sveltejs/kit";
import { GoogleOauthHelpers, OauthActionHelper } from "../helpers/oauth.server";
import { pasrseUserDataFromGoogleIdToken } from "../utils/common.server";
import { OAUTH_CALLBACK_ACTIONS, AUTH_RESPONSES } from "../enums";
import { AuthProvidersUtility, RefreshTokenUtility, TempDataUtility, UsersUtility } from "../utils/db.server";
import type { OauthCredentials, TempData, User } from "@prisma/client";
import { RSAKey } from "../utils/rsa-key.server";
import { CONFIRM_LINK_EXPIRY, DEVICE_TOKEN_COOKIE_NAME } from "$env/static/private";
import type { GoogleOauthTempData, OauthPageRequestedFromPage, RSAPayload, oAuthProviders } from "../types";
import { TokensUtility } from "../utils/tokens.server";


export class OauthCallbackHandlers {


    static async handleNotImplementedOauthCallback(...args: any[]) {
        console.log("not implemented oauth callback", args);
        return {
            status: 200,
        }
    }

    static async handleGoogleOauthCallback(siteUrl: string, searchParams: any, locals: App.Locals, cookies: Cookies, userLoggedIn: boolean, thePageRequestedFrom: OauthPageRequestedFromPage) {
        const { code } = searchParams; // everything that google passes in the url
        // console.log("google callback", siteUrl, code, locals, cookies, searchParams, userLoggedIn);

        // nothings general here
        let tempData = {
            provider: "google",
        } as GoogleOauthTempData;

        try {

            if (!thePageRequestedFrom) {
                throw new Error("no_request_page");
            }

            const oauth2Client = await GoogleOauthHelpers.getGoogleOauth2Client(siteUrl);
            const { tokens } = await oauth2Client.getToken(code); // save refresh_token, expiry_date from here
            // if (!tokens) {
            //     throw new Error("No tokens found");
            // }

            const gUserData = await pasrseUserDataFromGoogleIdToken(tokens.id_token as string); // save email, name, picture, email_verified
            // if (!gUserData) {
            //     throw new Error("No user data found");
            // }
            tempData = {
                ...tempData,
                oauth_refresh_token: tokens.refresh_token as string,
                oauth_refresh_expiry_date: tokens.expiry_date as number,
                oauth_user_email: gUserData.email,
                oauth_user_name: gUserData.name,
                oauth_user_picture: gUserData.picture,
                oauth_user_email_verified: gUserData.email_verified,


            }
            console.log("gUserData", gUserData);
        } catch (err: any) {
            console.log("google oauth callback error");
            if (err.message === "invalid_grant") {
                return {
                    OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES.SHOW_ERROR,
                    message: "Invalid code. Please try again.",
                }
            } else if (err.message === "no_request_page") {
                return {
                    OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES.SHOW_ERROR,
                    message: "Cookie issue. Please try again.",
                }
            }
            return {
                OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES.SHOW_ERROR,
                message: "Something went wrong. Please try again.",
            }
        }




        // take two string that sums up to something like login, register
        // generate thus strings every time they visit here
        // if something is wrong show them a message saying to try again





        /**
         * Cases:
         * Case 1: [LOGIN] Old User, Provider: google, email: google email [in OauthCredentials with provider: "google", email: google email, maybe in cookie, like: _nu=0, set from login page]
         * Case 2: [TC && MERGE] Old User: Provider: other provider(s), email: google email, [in OauthCredentials with provider: "not google", email: google email, maybe in cookie, like: _nu=0, set from login page]
         * Case 4: [REGISTER] New User from register page (encrypted register page value, maybe in cookies, like: _nu=1, set from register page)
         * Case 3: [TC && REGISTER] New User from login page (encrypted login page value, maybe in cookies, like: _nu=1, set from register page)
         */

        /* Find oauth callback action */
        const {
            OAUTH_CALLBACK_ACTION,
            OAUTH_CALLBACK_RESPONSE,
            userExistsWithProvider,
            userExistsWithOtherProvider,
        }: {
            OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS,
            OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES,
            userExistsWithProvider?: any,
            userExistsWithOtherProvider?: any,


        } = await OauthActionHelper.getOauthActionAndResponseType(tempData.provider as oAuthProviders, tempData.oauth_user_email, userLoggedIn, thePageRequestedFrom);

        // console.log("oauth tempData", tempData, thePageRequestedFrom, OAUTH_CALLBACK_ACTION, OAUTH_CALLBACK_RESPONSE);
        console.warn(`
        PAGE_REQUESTED_FROM: ${thePageRequestedFrom},

        OAUTH_CALLBACK_ACTION: ${OAUTH_CALLBACK_ACTION},
        OAUTH_CALLBACK_RESPONSE: ${OAUTH_CALLBACK_RESPONSE}
        `)

        /* Unknown action, nothing to do here */
        if (OAUTH_CALLBACK_ACTION === OAUTH_CALLBACK_ACTIONS.NONE) {
            return OauthActionHelper.returnWithErrorMessage("Something went wrong. No action defined in oauth callback.");
        }

        /* Unknown case */
        if (OAUTH_CALLBACK_RESPONSE === AUTH_RESPONSES.SHOW_ERROR) return OauthActionHelper.returnWithErrorMessage("Something went wrong. Please try again.");

        /* Take actions accordingly */

        if (OAUTH_CALLBACK_ACTION === OAUTH_CALLBACK_ACTIONS.LOGIN) {
            console.log("User Login Hobe", userExistsWithProvider);
            try {
                await OauthActionHelper.loginUserWithOauth(cookies, locals, userExistsWithProvider.user, tempData.provider as oAuthProviders);
                return { OAUTH_CALLBACK_ACTION, OAUTH_CALLBACK_RESPONSE, location: "/", message: "Logged in successfully. Re-directing to home page" }

            } catch (err: any) {
                return OauthActionHelper.returnWithErrorMessage(err.message);
            }
        }

        if (OAUTH_CALLBACK_ACTION === OAUTH_CALLBACK_ACTIONS.REGISTER) {
            if (OAUTH_CALLBACK_RESPONSE === AUTH_RESPONSES.CONFIRM) {

                const tempUserData: TempData = await TempDataUtility.create({ jsonStr: JSON.stringify(tempData) } as TempData);

                if (!tempUserData) return OauthActionHelper.returnWithErrorMessage("Something went wrong. Please try again. Could not create temp user data");

                // register after confirm
                const payloadString = JSON.stringify({
                    temp_user_id: tempUserData.id,
                    deviceToken: locals.device_token,
                    expiresAt: Date.now() + (1000 * parseInt(CONFIRM_LINK_EXPIRY))  // CONFIRM_LINK_EXPIRY seconds
                } as RSAPayload);

                const rvkey = encodeURIComponent(RSAKey.encrypt(payloadString) ?? "");
                return redirect(307, `/confirm-account/?rvkey=${rvkey}`);
            }

            // register user, and login
            // create the actual account
            const newUserId = crypto.randomUUID();
            let newUserName = tempData.oauth_user_email?.split("@")[0] ?? newUserId?.split("-")[3];
            const usernameExists = await UsersUtility.findUserByUsername(newUserName);
            if (usernameExists) newUserName = newUserName + newUserId?.split("-")[2];
            const newUserData = {
                username: newUserName,
                verified: tempData.oauth_user_email_verified,
                oauthCredentials: {
                    create: {
                        provider: tempData.provider,
                        providerEmail: tempData.oauth_user_email,
                        oauthRefreshToken: tempData.oauth_refresh_token,
                    }
                } as unknown as OauthCredentials,
            } as unknown as User;


            // create user
            const newUser = await UsersUtility.create(newUserData)
            if (!newUser) return OauthActionHelper.returnWithErrorMessage("Failed to create user.");

            try {
                await OauthActionHelper.loginUserWithOauth(cookies, locals, newUser, tempData.provider as oAuthProviders);
                return { OAUTH_CALLBACK_ACTION, OAUTH_CALLBACK_RESPONSE, location: "/", message: "Account created successfully. Re-directing to register page" }

            } catch (err: any) {
                return OauthActionHelper.returnWithErrorMessage(err.message);
            }

        }

        if (OAUTH_CALLBACK_ACTION === OAUTH_CALLBACK_ACTIONS.MERGE) {
            console.log("User Merge Hobe", userExistsWithOtherProvider);
        }

        if (OAUTH_CALLBACK_ACTION === OAUTH_CALLBACK_ACTIONS.LINK) {
            console.log("User Link Hobe", userExistsWithOtherProvider);
        }



    }
}
