import { JWT_COOKIE_NAME, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "$env/static/private";
import prisma from "$lib/server/prisma";
import { findUniqueUserWithID, findUsersWithEmailOrUsername, updateOAuthCredentials } from "$lib/utils/auth-utils.server";
import { decodeBase64TokenObject, deleteAuthCookies, generateAuthTokens, setAuthCookies, validateToken } from "$lib/utils/utils.server";
import type { OauthCredentials, User } from "@prisma/client";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
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
                    let accessV = await validateToken(access, JWT_ACCESS_SECRET);
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
                        let refreshV = await validateToken(refresh, JWT_REFRESH_SECRET);
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

                            const oauthCredentials = someUser.oauthCredentials.find((cred) => cred.provider === provider);

                            if (oauthCredentials) {
                                // normally thakar kotha
                                console.log("user ache", someUser, oauthCredentials);

                                const newTokens = await generateAuthTokens({
                                    id: refreshV.data.id,
                                    username: refreshV.data.username
                                });
                                await updateOAuthCredentials(oauthCredentials.id, {
                                    refreshToken: newTokens.refreshToken,
                                } as OauthCredentials);

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