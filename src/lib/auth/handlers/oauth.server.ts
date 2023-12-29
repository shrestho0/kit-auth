import type { Cookies } from "@sveltejs/kit";
import { GoogleOauthHelpers, OauthActionHelper } from "../helpers/oauth.server";
import { pasrseUserDataFromGoogleIdToken } from "../utils/common.server";
import { OAUTH_CALLBACK_RESPONSES } from "../enums";


export class OauthCallbackHandlers {


    static async handleNotImplementedOauthCallback(...args: any[]) {
        console.log("not implemented oauth callback", args);
        return {
            status: 200,
        }
    }

    static async handleGoogleOauthCallback(siteUrl: string, searchParams: any, locals: App.Locals, cookies: Cookies, userLoggedIn: boolean, thePageRequestedFrom: "register" | "login" | undefined) {
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
                    OAUTH_CALLBACK_RESPONSE: OAUTH_CALLBACK_RESPONSES.SHOW_ERROR,
                    message: err.message,
                }
            } else if (err.message === "no_request_page") {
                return {
                    OAUTH_CALLBACK_RESPONSE: OAUTH_CALLBACK_RESPONSES.SHOW_ERROR,
                    message: "Cookie issue. Please try again.",
                }
            }
            return {
                OAUTH_CALLBACK_RESPONSE: OAUTH_CALLBACK_RESPONSES.SHOW_ERROR,
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
        const oauthAction = await OauthActionHelper.getOauthAction(tempData.oauth_user_email, userLoggedIn, thePageRequestedFrom);

        console.log("oauth tempData", tempData, thePageRequestedFrom, oauthAction);

        /* Take actions accordingly */



    }
}