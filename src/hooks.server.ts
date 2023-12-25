import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { JWT_COOKIE_NAME, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "$env/static/private";
import { ServerSideCookieUtility } from "$lib/auth/utils/cookies.server";
import { TokensUtility } from "$lib/auth/utils/tokens.server";
import { decodeBase64TokenObject } from "$lib/auth/utils/common.server";
import { RefreshTokenUtility, UsersUtility } from "$lib/auth/utils/db.server";
import type { RefreshToken } from "@prisma/client";



const AuthHandler: Handle = async ({ event, resolve }) => {

    // do something

    // check for cookies && handle accordingly

    /* Cookies */

    // Device Token
    if (!TokensUtility.checkDeviceTokenValidity(event.cookies)) TokensUtility.ensureDeviceTokenCookie(event.cookies);

    // Auth Token
    const userAuthTokens = TokensUtility.getAuthToken(event.cookies);

    // No Auth Token
    if (!userAuthTokens) return await resolve(event);


    const { access, refresh, provider } = decodeBase64TokenObject(userAuthTokens);

    if (!access || !refresh || !provider) {
        TokensUtility.deleteAuthTokenCookie(event.cookies);
        return await resolve(event);
    };


    // Checking Access Token
    const accessT = await TokensUtility.checkAccessTokenValidity(access);

    if (accessT != null) {
        const { id, username, } = accessT;

        if (!id || !username) {
            TokensUtility.deleteAuthTokenCookie(event.cookies);
            return await resolve(event)
        };

        event.locals.user_id = id;
        event.locals.user_username = username;
        console.log("Valid Access token found ");
        return await resolve(event);
    }

    // Access Token Expired

    const refreshT = await TokensUtility.checkRefreshTokenValidity(refresh);
    if (refreshT != null) {
        const { id, username } = refreshT;

        if (!id || !username) {
            TokensUtility.deleteAuthTokenCookie(event.cookies);
            return await resolve(event)
        };

        // Check if user exists
        // const user = await UsersUtility.get(id);
        // no need to check user
        // check if refreshtoken exists
        const depRefreshToken = await RefreshTokenUtility.getByRefreshToken(refresh);

        if (!depRefreshToken) {
            TokensUtility.deleteAuthTokenCookie(event.cookies);
            return await resolve(event)
        }


        // if (!user) {
        //     // Delete refresh token and device too
        //     TokensUtility.deleteAuthTokenCookie(event.cookies);
        //     TokensUtility.deleteDeviceTokenCookie(event.cookies);
        //     return await resolve(event)
        // } else {
        // Generate new tokens

        const { accessToken, refreshToken } = await TokensUtility.generateAuthTokens({ id, username });
        // console.log("New tokens generated", { accessToken, refreshToken });
        // update this to database
        const updatedRefreshToken = await RefreshTokenUtility.updateByToken(refresh, {
            refreshToken,
        } as RefreshToken);


        // });
        TokensUtility.ensureAuthTokenCookie(event.cookies, { accessToken, refreshToken }, provider);

        event.locals.user_id = id;
        event.locals.user_username = username;
        console.log("Valid Refresh token found && updated", updatedRefreshToken);
        return await resolve(event);
        // }

    }





















    // Refresh







    // check if device token exists



    // else, do nothing


    console.log("Unhandeled case, deleting cookies");
    TokensUtility.deleteAuthTokenCookie(event.cookies);
    const response = await resolve(event)
    return response
}

// const DeviceTokenHandler: Handle = async ({ event, resolve }) => {

//     console.log("inside device token handler");

//     // check if device token exists
//     // check if cookie is valid
//     if (!ServerSideCookieUtility.getDeviceToken(event.cookies)) {
//         //  if not, generate one
//         // set that to the cookie with no expiry
//         console.log("device token nei");
//         const deviceToken = ServerSideCookieUtility.generateDeviceToken();
//         ServerSideCookieUtility.setDeviceToken(event.cookies, deviceToken);
//     }
//     // else we don't care

//     return await resolve(event);
// }



export const handle: Handle = sequence(AuthHandler);
