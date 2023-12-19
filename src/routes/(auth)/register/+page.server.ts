
import prisma from "$lib/server/prisma";
import { returnFailClientError, returnFailServerError } from "$lib/utils/error-utils.server";
import { createOAuthCredentials, findUsersWithEmailOrUsername } from "$lib/utils/auth-utils.server";
import { comparePassword, generateAuthTokens, hashPassword, setAuthCookies } from "$lib/utils/utils.server";
import { userRegisterSchema } from "$lib/validations/auth-validation";
import { fail, type Actions, redirect } from "@sveltejs/kit";
import type { OauthCredentials } from "@prisma/client";
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
        // console.log(validatedData.success, validatedData?.error);
        if (!validatedData.success) {

            // return fail(400, {
            //     success: false,
            //     errors: structuredClone(validatedData.error.errors)
            // })
            return returnFailClientError(400, structuredClone(validatedData.error.errors));
        }

        const users = await findUsersWithEmailOrUsername({
            email: validatedData.data.email,
            username: validatedData.data.username,
            oProviders: true
        });
        // check if was the email or username

        if (users === undefined) return returnFailServerError();


        if (users.length == 0) {

            // console.log("trying to create user");

            const data = await prisma.user.create({
                data: {
                    username: validatedData.data.username,
                    email: validatedData.data.email,
                    passwordHash: await hashPassword(validatedData.data.password),
                }

            })
            if (data) {
                locals.user_id = data.id;
                locals.user_username = data.username;

            }
            // console.log("after prisma", data);

        } else {
            // console.log("already has account", users);
            let errorX: any = [];
            users.forEach(user => {
                if (user.username == validatedData.data.username) {
                    errorX.push({
                        path: ["username"],
                        message: "Username already exists"
                    })
                }
                if (user.email == validatedData.data.email) {
                    errorX.push({
                        path: ["email"],
                        message: "Email already exists"
                    })
                }
            });
            return returnFailClientError(400, errorX);

        }





        // jodi shob thik thake

        if (locals.user_id && locals.user_username) {


            // create jwt token
            const tokens: Tokens = await generateAuthTokens({
                id: locals.user_id as string,
                username: locals.user_username as string
            });

            const provider = "password";

            await createOAuthCredentials({
                userId: locals.user_id,
                provider,
                refreshToken: tokens.refreshToken,

            } as OauthCredentials)


            // set cookies
            await setAuthCookies(cookies, tokens, provider);

            return redirect(307, "/");


        } else return returnFailServerError();

    },
};