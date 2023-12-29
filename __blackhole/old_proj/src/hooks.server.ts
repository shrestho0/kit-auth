import { JWT_COOKIE_NAME, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "$env/static/private";
import { RefreshTokenUtility, ServerSideCookieUtility, findUniqueUserWithID, findUsersWithEmailOrUsername, updateOAuthCredentials } from "$lib/utils/auth-utils.server";
import { decodeBase64TokenObject, deleteAuthCookies, generateAuthTokens, setAuthCookies, validateAuthToken } from "$lib/utils/utils.server";
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";



const AuthHandler: Handle = async ({ event, resolve }) => {
    // it's inside server, that's okay ig
    console.log("inside server hook");
    const authCookie = event.cookies.get(JWT_COOKIE_NAME)


    if (authCookie) {
        console.log("cookie exists");
        try {

            const { access, refresh, provider } = decodeBase64TokenObject(authCookie);
            if (access && refresh && provider) {
                // if (provider === "password") {

                try {
                    let accessV = await validateAuthToken(access, JWT_ACCESS_SECRET);
                    // user is valid here
                    console.log("access", accessV.valid, accessV.data);
                    // send users to specific adapters maybe
                    // TODO: check for user in database

                    if (accessV.valid) {
                        event.locals.user_id = accessV.data.id;
                        event.locals.user_username = accessV.data.username;
                        return await resolve(event);;
                    } else {
                        // access er meyad shesh
                        // check refresh and update tokens
                        let refreshV = await validateAuthToken(refresh, JWT_REFRESH_SECRET);
                        console.log("refresh", refreshV.valid, refreshV.data);
                        if (refreshV.valid) {

                            // shob thik ache
                            // update tokens
                            // check if the user exists now. if not, delete cookies
                            const someUser = await findUniqueUserWithID(refreshV.data.id);
                            if (!someUser) {
                                await deleteAuthCookies(event.cookies);
                                event.locals.user_id = null;
                                event.locals.user_username = null;
                                return await resolve(event);
                            }
                            // user ache

                            // delete hobe
                            // const oauthCredentials = someUser.oauthCredentials.find((cred) => cred.provider === provider);
                            // const theToken = await getRefreshToken({
                            //     userId: refreshV.data.id,
                            // })
                            const theToken = await RefreshTokenUtility.getByUserId(refreshV.data.id);
                            RefreshTokenUtility
                            if (theToken) {
                                // normally thakar kotha
                                console.log("user ache", someUser, theToken);

                                // generated new token
                                const newTokens = await generateAuthTokens({
                                    id: refreshV.data.id,
                                    username: refreshV.data.username
                                });

                                // update refresh token

                                // delete hobe
                                // await updateOAuthCredentials(oauthCredentials.id, {
                                //     refreshToken: newTokens.refreshToken,
                                // } as OauthCredentials);

                                await RefreshTokenUtility.update(theToken.id, {
                                    refreshToken: newTokens.refreshToken
                                })

                                event.locals.user_id = refreshV.data.id;
                                event.locals.user_username = refreshV.data.username;

                                setAuthCookies(event.cookies, newTokens, provider);
                            }
                        }
                        console.log("refreshed", refreshV.valid, refreshV.data);
                    }

                } catch (err) {
                    await deleteAuthCookies(event.cookies);
                }
            } else {
                console.log("has cookies but not able to find tokens", access, refresh, provider);
                // just continues
            }

        } catch (err) {
            console.log(err);
            await deleteAuthCookies(event.cookies);
        }
    } else {
        // cookie doesn't exists
        console.log("no cookie found, anonymous user");
        console.log(event.cookies.getAll())
    }

    // check user's credentials with cookies
    // // get cookies
    // // check provider
    // // check token
    // // update auth state
    // // update user

    const response = await resolve(event);
    return response;
};


const DeviceTokenHandler: Handle = async ({ event, resolve }) => {

    console.log("inside device token handler");

    // check if device token exists
    // check if cookie is valid
    if (!ServerSideCookieUtility.getDeviceTokenCookie(event.cookies)) {
        //  if not, generate one
        // set that to the cookie with no expiry
        console.log("device token nei");
        const deviceToken = ServerSideCookieUtility.generateDeviceToken();
        ServerSideCookieUtility.setDeviceToken(event.cookies, deviceToken);
    }
    // else we don't care

    return await resolve(event);
}


export const handle: Handle = sequence(DeviceTokenHandler, AuthHandler);