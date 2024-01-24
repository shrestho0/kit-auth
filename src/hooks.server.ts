import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { TokensUtility } from "$lib/auth/utils/tokens.server";
import { RefreshTokenUtility, UserDeviceUtility } from "$lib/auth/utils/db.server";
import type { RefreshToken } from "@prisma/client";
import { parseUserAgent } from "$lib/utils";


const AuthHandler: Handle = async ({ event, resolve }) => {


    const userAgent = event.request.headers.get("user-agent") || "";
    console.log(parseUserAgent(userAgent));

    TokensUtility.ensureDeviceTokenCookie(event);


    /* Check if Auth Token exists */
    const userAuthTokens = TokensUtility.getAuthToken(event.cookies);

    /* No Auth token, nothing to do */
    if (!userAuthTokens) return await resolve(event);

    /* Check if Auth Tokens are valid */
    const { access, refresh, provider } = TokensUtility.parseAuthTokensObject(userAuthTokens);
    if (!access || !refresh || !provider) {
        console.log("Invalid Auth Tokens. Deleting cookies");
        TokensUtility.deleteAuthTokenCookie(event.cookies);
        return await resolve(event);
    };


    /* Check Access Token */
    const accessT = await TokensUtility.checkJWTTokenValidity(access, "access");
    if (accessT != null) {
        const { id, username, } = accessT;

        if (!id || !username) {
            console.log("Invalid Access token found. Deleting cookies");
            TokensUtility.deleteAuthTokenCookie(event.cookies);
            return await resolve(event)
        };

        event.locals.user_id = id;
        event.locals.user_username = username;
        console.log("Valid Access token found ");
        return await resolve(event);
    }

    /* Access Token Expired here, Check Refresh Token */
    const refreshT = await TokensUtility.checkJWTTokenValidity(refresh, "refresh");
    if (refreshT != null) {
        const { id, username } = refreshT;

        if (!id || !username) {
            console.log("Invalid Refresh token found. Deleting cookies");
            TokensUtility.deleteAuthTokenCookie(event.cookies);
            return await resolve(event)
        };

        const depRefreshToken = await RefreshTokenUtility.getByRefreshToken(refresh, true);

        if (!depRefreshToken) {
            TokensUtility.deleteAuthTokenCookie(event.cookies);
            return await resolve(event)
        }

        console.log("TOKEN TOKEN TOKEN", depRefreshToken?.UserDevice[0].deviceToken === event.locals.device_token)
        /* If refresh token okay but user changed their deviceToken, we'll delete refreshToken and log them out */

        if (depRefreshToken?.UserDevice[0].deviceToken != event.locals.device_token) {
            console.log("Device token changed. Deleting cookies");
            // delete refresh token
            await RefreshTokenUtility.deleteByToken(refresh);
            // delete device token
            await UserDeviceUtility.deleteIfExistsByUserAndDeviceToken(id, depRefreshToken.UserDevice.deviceToken);
            // delete auth cookies
            TokensUtility.deleteAuthTokenCookie(event.cookies);
            // delete device token cookies
            TokensUtility.deleteDeviceTokenCookie(event.cookies);

            return await resolve(event)
        }

        /* Generate and Update && Ensure Cookie new tokens */
        const { accessToken, refreshToken } = await TokensUtility.generateAuthTokens({ id, username });

        const updatedRefreshToken = await RefreshTokenUtility.updateByToken(refresh, {
            refreshToken,
        } as RefreshToken);

        TokensUtility.ensureAuthTokenCookie(event.cookies, { accessToken, refreshToken }, provider);

        event.locals.user_id = id;
        event.locals.user_username = username;
        console.log("Valid Refresh token found && updated", updatedRefreshToken);

        return await resolve(event);
    }

    /* else, do nothing */

    console.log("Unhandeled case, deleting cookies");
    TokensUtility.deleteAuthTokenCookie(event.cookies);
    // TokensUtility.deleteDeviceTokenCookie(event.cookies); // TODO: check if this is needed

    return await resolve(event);
}



export const handle: Handle = sequence(AuthHandler);
