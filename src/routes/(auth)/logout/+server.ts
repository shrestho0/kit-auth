import { RefreshTokenUtility } from "$lib/auth/utils/db.server";
import { TokensUtility } from "$lib/auth/utils/tokens.server";
import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals, cookies }) => {
    if (locals.user_id && locals.user_username) {

        const tokens = TokensUtility.getAuthToken(cookies) as string;
        const { refresh } = TokensUtility.parseAuthTokensObject(tokens);
        if (refresh) {
            const refreshT = await TokensUtility.checkJWTTokenValidity(refresh, "refresh");
            const deletedDevice$ = await RefreshTokenUtility.deleteByToken(refresh);
            console.log("deleted refresh token from db", deletedDevice$?.hasOwnProperty("refreshToken"));

        } else {

        }


        const deleted$ = TokensUtility.deleteAuthTokenCookie(cookies);
        console.log("deleted auth token cookie", deleted$);

        return json({
            success: true,
            message: "Logged out successfully"
        })
    }

    return json({
        success: false,
        message: "Unauthorized"
    })
} 