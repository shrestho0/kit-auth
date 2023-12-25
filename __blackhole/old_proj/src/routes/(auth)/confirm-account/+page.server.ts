import { RSAKey } from "$lib/server/rsa-key";
import { redirect, type Action, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { deleteTempUser, getTempUser, parseRVKeyAndGetTempUser } from "$lib/utils/auth-utils.server";
import prisma from "$lib/server/prisma";
import { generateRandomUserName } from "$lib/utils/utils.common";
import { generateAuthTokens, setAuthCookies } from "$lib/utils/utils.server";
import { RSAKeyError } from "$lib/utils/error-utils.server";




export const load: PageServerLoad = async ({ locals, url, cookies }) => {
    if (locals.user_id && locals.user_username) {
        return redirect(307, "/");
    }

    console.log("await confirmation for account creating");

    const rvkey = url.searchParams.get("rvkey");

    if (!rvkey) return redirect(307, "/");

    const dfCookie = cookies.get("_tf")


    try {


        const tempUser = await parseRVKeyAndGetTempUser(rvkey as string, dfCookie as string);


        return {
            success: true,
            email: tempUser.email,
            provider: tempUser.provider,

        }

    } catch (e) {
        if (e instanceof RSAKeyError) {
            // return redirect(307, "/");
            return {
                success: false,
                message: e?.message ?? "Invalid request"
            }
        }
        console.log(e);
        return redirect(307, "/");
    }

}

export const actions: Actions = {
    confirm: async ({ cookies, request, url }) => {
        console.log("user request confirmation");

        const rvkey = url.searchParams.get("rvkey");
        if (!rvkey) return redirect(307, "/");
        const dfCookie = cookies.get("_tf")

        try {

            const tempUser = await parseRVKeyAndGetTempUser(rvkey as string, dfCookie as string);


            console.log("temp user found", tempUser);
            //...

            const randomDefinedUserName = generateRandomUserName(); // in case username failed
            // generate tokens for new user
            const { accessToken, refreshToken } = await generateAuthTokens({
                id: tempUser.id,
                username: tempUser.username ?? randomDefinedUserName,
            })
            // create user
            const permanentUser = await prisma.user.create({
                data: {
                    id: tempUser.id,
                    
                    username: tempUser.username ?? randomDefinedUserName,
                    name: tempUser.name,
                    verified: true,

                    oauthCredentials: {
                        create: {
                            provider: tempUser.provider as string,
                            providerEmail: tempUser.email as string,
                            oauthRefreshToken: tempUser.oauthRefreshToken as string,
                        }
                    },
                    RefreshTokens: {
                        create: {
                            refreshToken: refreshToken,
                        }
                    }

                }
            })
            if (!permanentUser) {
                throw new Error("Permanent user not created")
            }

            // set cookies
            setAuthCookies(cookies, {
                accessToken,
                refreshToken
            }, tempUser.provider as oAuthProviders, true);


            // delete temp user
            await deleteTempUser(tempUser.id);

            return {
                success: 200,
                message: "Account created successfully"
            }

        } catch (err) {
            console.log(err);
            if (err instanceof RSAKeyError) {

                return {
                    success: false,
                    message: "Invalid request"
                }
            } else {
                return {
                    success: false,
                    message: "Something went wrong"
                }
            }

        }



    },
    cancel: async ({ cookies, request, url }) => {
        // delete temp user
        // redirect to home page
        console.log("user request cancelation", url.searchParams.get("rvkey"));
        const rvkey = url.searchParams.get("rvkey");
        if (!rvkey) return redirect(307, "/");
        const dfCookie = cookies.get("_tf")

        try {

            const tempUser = await parseRVKeyAndGetTempUser(rvkey as string, dfCookie as string);

            console.log("shob thik ache, delete hobe",);
            await deleteTempUser(tempUser.id);

            return {
                success: true,
                message: "Account creation canceled"
            }
        } catch (err) {
            console.log(err);
            if (err instanceof RSAKeyError) {

                return {
                    success: false,
                    message: "Invalid request"
                }
            } else {
                return {
                    success: false,
                    message: "Something went wrong"
                }
            }
        }

    }
};
