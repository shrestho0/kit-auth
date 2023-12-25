import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { TokensUtility } from "$lib/auth/utils/tokens.server";
import { RefreshTokenUtility, UserDeviceUtility } from "$lib/auth/utils/db.server";
import prisma from "$lib/server/db/prisma";
import { decodeBase64TokenObject } from "$lib/auth/utils/common.server";



export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user_id && locals.user_username) {
        return redirect(307, "/login");
    }
    return redirect(307, "/");
};

export const actions: Actions = {
    default: async ({ request, locals, cookies }) => {
        if (locals.user_id && locals.user_username) {

            console.log("deleted auth token cookie");
            const tokens = TokensUtility.getAuthToken(cookies) as string;
            const { refresh } = decodeBase64TokenObject(tokens);
            const refreshT = await TokensUtility.checkRefreshTokenValidity(refresh);

            if (!refreshT) {
                // Something went wrong
                // There is no [VALID] refresh token in cookie
                // TODO: Delete refresh token from db
            }

            const deletedDevice = await RefreshTokenUtility.deleteByToken(refresh);
            console.log("deleted refresh token from db", deletedDevice);

            TokensUtility.deleteAuthTokenCookie(cookies);

            // const deletedDevice = await RefreshTokenUtility.getByRefreshToken(refresh);




            // console.log("refreshToken", refresh, deletedDevice);
            // const deletedDevice = await UserDeviceUtility.delete() 
            // const deleteDeviceAndRefreshToken = await prisma.refreshToken.delete({
            //     where: {
            //         id: locals.user_refresh_token_id
            //     }
            // })

            // TODO: Delete refresh token from db


            // TODO: Delete device token from db


            return redirect(307, "/login");
        }

    }
};

// export const POST: RequestHandler = async ({ request, locals, cookies }) => {
//     if (locals.user_id && locals.user_username) {

//         // get users auth providers

//         deleteAuthCookies(cookies);

//         return json({
//             success: true,
//             message: "Logged out successfully! not actually!"
//         }, {
//             status: 200
//         })
//     } else {
//         return json({
//             success: false,
//             message: "Not logged in"
//         }, {
//             status: 401,
//         })
//     }
// };