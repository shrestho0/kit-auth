
// import prisma from "$lib/server/prisma";
import { returnFailClientError, returnFailServerError } from "$auth/utils/errors.server";
import { userRegisterSchema } from "$auth/validation";
import { generateAuthTokens, hashPassword } from "$lib/auth/utils/common.server";
import { UsersUtility } from "$lib/auth/utils/db.server";
import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { OauthCredentials, User } from "@prisma/client";
import { TokensUtility } from "$lib/auth/utils/tokens.server";
import prisma from "$lib/server/db/prisma";


export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user_id && locals.user_username) {
        return redirect(307, "/");
    }
};


export const actions: Actions = {
    password: async ({ request, locals, cookies }) => {
        const regData = Object.fromEntries(await request.formData());

        // Check if user exists with that username or email

        const validatedData = userRegisterSchema.safeParse(regData);

        // handling validation errors
        if (!validatedData.success) {
            return returnFailClientError(400, structuredClone(validatedData.error.errors));
        }

        // handle existsing users

        const userWithEmail = await UsersUtility.findUserByEmail(validatedData.data.email);
        const userWithUsername = await UsersUtility.findUserByUsername(validatedData.data.username);

        let errors = [];
        if (userWithEmail) {
            errors.push({
                path: ["email"],
                message: "Email already exists"
            })
        }
        if (userWithUsername) {
            errors.push({
                path: ["username"],
                message: "Username already exists"
            })
        }

        if (userWithEmail || userWithUsername) {
            return returnFailClientError(400, errors);
        }




        const newUserData = {
            username: validatedData.data.username,
            oauthCredentials: {
                create: {
                    provider: "password",
                    providerEmail: validatedData.data.email,
                    passwordHash: await hashPassword(validatedData.data.password),

                }
            } as unknown as OauthCredentials,


        } as unknown as User;





        const newUser = await UsersUtility.create(newUserData);
        if (!newUser) return returnFailServerError(500, {
            message: "Failed to create user"
        });



        const deviceToken = TokensUtility.getDeviceToken(cookies);

        const authTokens = TokensUtility.generateAuthTokens({
            username: validatedData.data.username,
            id: newUser.id
        });


        const userDevice = await prisma.userDevice.create({
            data: {
                deviceToken: deviceToken ?? "",
                userId: newUser.id,
                deviceDataJson: "pore hobe",
            }
        })

        const refreshToken = await prisma.refreshToken.create({
            data: {
                userId: newUser.id,
                refreshToken: authTokens.refreshToken,
                deviceTokenId: userDevice.id
            }

        })

        console.log(`User: ${structuredClone(newUser)} created with refresh token: ${structuredClone(refreshToken)} and device: ${structuredClone(userDevice)}`);

        TokensUtility.ensureAuthTokenCookie(cookies, authTokens, "password");

        return redirect(307, "/");

    }
};