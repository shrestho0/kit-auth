import { error, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { DEVICE_TOKEN_COOKIE_NAME } from "$env/static/private";
import { RSAKey } from "$lib/auth/utils/rsa-key.server";
import type { GoogleOauthTempData, RSAPayload, oAuthProviders } from "$lib/auth/types";
import { RefreshTokenUtility, TempDataUtility, UsersUtility } from "$lib/auth/utils/db.server";
import { OAUTH_CALLBACK_ACTIONS, AUTH_RESPONSES } from "$lib/auth/enums";
import type { OauthCredentials, TempData, User } from "@prisma/client";
import { TokensUtility } from "$lib/auth/utils/tokens.server";

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
    if (locals.user_id && locals.user_username) {
        return redirect(307, "/");
    }

    console.log("await confirmation for account creating");

    const rvkey = url.searchParams.get("rvkey");

    if (!rvkey) return redirect(307, "/");

    // console.log("deviceToken", deviceToken, locals.device_token);


    try {
        const { temp_user_id, deviceToken, expiresAt }: RSAPayload = JSON.parse(RSAKey.decrypt(rvkey as string));
        console.log("CONFIRM_ACCOUNT_DEBUG", temp_user_id, deviceToken, expiresAt)

        if (!temp_user_id || !deviceToken || !expiresAt) throw new Error("Data missing in rsa token payload");

        if (deviceToken !== locals.device_token) throw new Error("Device token mismatch");

        if (expiresAt < Date.now()) throw new Error("Link expired");

        const tempData: TempData | null = await TempDataUtility.get(temp_user_id);
        if (!tempData) throw new Error("Invalid temp user. Please retry registration");

        return {
            ACTION: AUTH_RESPONSES.CONFIRM,
            data: JSON.parse(tempData.jsonStr),

        }

        // if()
    } catch (e: any) {
        console.log(e);
        return error(403, {
            message: e?.message ?? "Invalid request"
        })
    }
}

export const actions: Actions = {
    confirm: async ({ request, locals, cookies, url }) => {
        try {

            const tempData = await proccessTempDataOrThrow(locals, url);
            const tempUserData: GoogleOauthTempData = JSON.parse(tempData.jsonStr);
            console.log("CONFIRM_ACCOUNT_DEBUG; USER CONFIRMED", tempUserData);

            // create and login user



            const deletedTempData = await TempDataUtility.delete(tempData.id);

            if (!deletedTempData) throw new Error("Could not delete temp data");


            // create the actual account
            const newUserId = crypto.randomUUID();

            let newUserName = tempUserData.oauth_user_email?.split("@")[0] ?? newUserId?.split("-")[3];

            const usernameExists = await UsersUtility.findUserByUsername(newUserName);

            if (usernameExists) newUserName = newUserName + newUserId?.split("-")[2];

            const newUserData = {
                username: newUserName,
                verified: tempUserData.oauth_user_email_verified,
                oauthCredentials: {
                    create: {
                        provider: tempUserData.provider,
                        providerEmail: tempUserData.oauth_user_email,
                        oauthRefreshToken: tempUserData.oauth_refresh_token,
                    }
                } as unknown as OauthCredentials,


            } as unknown as User;

            const newUser = await UsersUtility.create(newUserData)
            if (!newUser) throw new Error("Could not create user");

            const authTokens = TokensUtility.generateAuthTokens({
                username: newUser.username,
                id: newUser.id
            });


            const refreshAndDeviceData = {
                userId: newUser.id,
                refreshToken: authTokens.refreshToken,
                UserDevice: {
                    create: {
                        userId: newUser.id,
                        deviceToken: locals.device_token ?? "",
                        deviceDataJson: `{"todo": "not implemented"}`,
                    }
                }
            }
            const refreshTokenAndUserDevice = await RefreshTokenUtility.create(refreshAndDeviceData);

            if (!refreshTokenAndUserDevice) throw new Error("Could not create refresh token and user device");

            TokensUtility.ensureAuthTokenCookie(cookies, authTokens, tempUserData.provider as oAuthProviders);


            return {
                success: true,
                action: AUTH_RESPONSES.SUCCESS_REDIRECT,
                location: "/",
                message: "Account created successfully. Re-directing to register page"
            }
        } catch (e: any) {

            return error(403, {
                message: e?.message ?? "Invalid request"
            })
        }
    },
    cancel: async ({ request, locals, cookies, url }) => {
        try {

            const tempData = await proccessTempDataOrThrow(locals, url);

            const deletedTempData = await TempDataUtility.delete(tempData.id);

            if (!deletedTempData) throw new Error("Could not delete temp data");

            return {
                success: true,
                action: AUTH_RESPONSES.SUCCESS_REDIRECT,
                location: "/register",
                message: "Account creation cancelled."
            }
        } catch (e: any) {
            return error(403, {
                message: e?.message ?? "Invalid request"
            })
        }
    }


}

async function proccessTempDataOrThrow(locals: App.Locals, url: URL) {

    const rvkey = url.searchParams.get("rvkey");
    if (!rvkey) throw new Error("Could not find token in url");

    const { temp_user_id, deviceToken, expiresAt }: RSAPayload = JSON.parse(RSAKey.decrypt(rvkey as string));


    console.log("CONFIRM_ACCOUNT_DEBUG; USER REQUESTED CONFIRMATION", temp_user_id, deviceToken, expiresAt)

    if (!temp_user_id || !deviceToken || !expiresAt) throw new Error("Data missing in rsa token payload");

    if (deviceToken !== locals.device_token) throw new Error("Device token mismatch");

    if (expiresAt < Date.now()) throw new Error("Link expired");

    const tempData = await TempDataUtility.get(temp_user_id);
    if (!tempData) throw new Error("Invalid temp user. Please retry registration");

    return tempData;
}