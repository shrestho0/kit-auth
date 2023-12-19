
import prisma from "$lib/server/prisma";
import { returnFailClientError, returnFailServerError } from "$lib/utils/error-utils.server";
import { AuthProvidersUtility, RefreshTokenUtility, UsersUtility, createOAuthCredentials, findUsersWithEmailOrUsername } from "$lib/utils/auth-utils.server";
import { comparePassword, generateAuthTokens, hashPassword, resultOrNull, setAuthCookies } from "$lib/utils/utils.server";
import { userRegisterSchema } from "$lib/validations/auth-validation";
import { fail, type Actions, redirect } from "@sveltejs/kit";
import type { OauthCredentials, RefreshTokens } from "@prisma/client";
import type { PageServerLoad } from "./$types";

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
                    passwordHash: await hashPassword(validatedData.data.password)
                }
            },
        }

        const newUser = await UsersUtility.create(newUserData);

        if (!newUser) return returnFailServerError(500, {
            message: "Failed to create user"
        });

        const tokens = await generateAuthTokens({
            username: validatedData.data.username,
            id: newUser.id
        });

        await RefreshTokenUtility.create({
            userId: newUser.id,
            refreshToken: tokens.refreshToken,
        } as RefreshTokens)


        await setAuthCookies(cookies, tokens, "password");

        return redirect(307, "/");

    }
};