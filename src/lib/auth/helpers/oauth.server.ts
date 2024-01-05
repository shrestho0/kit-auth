import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OAUTH_REDIRECT } from "$env/static/private";
import { redirect, type Actions, type Action, fail, type Cookies } from "@sveltejs/kit";
import { google } from "googleapis";
import bcrypt from 'bcrypt';

import { TokensUtility } from "$auth/utils/tokens.server";
import { returnFailClientError, returnFailServerError } from "$auth/utils/errors.server";
import { userLoginSchema, userRegisterSchema, userSetPasswordSchema } from "../validation";
import { AuthProvidersUtility, RefreshTokenUtility, UserDeviceUtility, UsersUtility } from "$auth/utils/db.server";
import { pasrseUserDataFromGoogleIdToken } from "$auth/utils/common.server";
import { OAUTH_CALLBACK_ACTIONS, AUTH_RESPONSES } from "$auth/enums";
import { ServerSideCookieUtility } from "../utils/cookies.server";
import type { OauthPageRequestedFromPage, oAuthProviders } from "../types";
import type { OauthCredentials, User } from "@prisma/client";



export class OauthActionHelper {


    static handleAddOauthSubmission(): Action {
        return async ({ request, locals, cookies }) => {
            const { password, passwordConfirm, email } = Object.fromEntries(await request.formData());
            console.log("password", password, passwordConfirm, email);
            if (password !== passwordConfirm) return returnFailClientError(400, {
                message: "Passwords do not match"
            });
            const validatedPassword = userSetPasswordSchema.safeParse({ password, email });
            if (!validatedPassword.success) {
                console.log("validatedPassword", validatedPassword.error);
                return returnFailClientError(400, {
                    message: "Invalid password. Min 8, max 64 characters."
                });
            }

            const providerExists = await AuthProvidersUtility.getByUserId(locals.user_id as string);

            // check if password exists

            if (providerExists.find((provider: OauthCredentials) => provider.provider === 'password')) {
                return returnFailClientError(400, {
                    message: "Password already exists"
                });
            }


            // if email does not exists fuck
            if (providerExists.find((provider: OauthCredentials) => provider.providerEmail == validatedPassword.data.email)?.length === 0) {
                return returnFailClientError(400, {
                    message: "Email changed, can not proceed the request. Email does not match any of your provider"
                })
            }


            if (!(await AuthProvidersUtility.create({
                provider: "password",
                providerEmail: validatedPassword.data.email,
                passwordHash: await PasswordAuthHelper.hashPassword(validatedPassword.data.password),
                userId: locals.user_id as string,
            } as unknown as OauthCredentials))) {
                return returnFailServerError(500, {
                    message: "Failed to create provider"
                });
            }


            return {
                success: true,
                message: "not implemented"
            }
        }
    }

    static handlePasswordRegisterSubmission(): Action {
        return async ({ request, locals, cookies }) => {
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
                        passwordHash: await PasswordAuthHelper.hashPassword(validatedData.data.password),

                    }
                } as unknown as OauthCredentials,


            } as unknown as User;





            const newUser = await UsersUtility.create(newUserData);
            if (!newUser) return returnFailServerError(500, {
                message: "Failed to create user"
            });




            const authTokens = TokensUtility.generateAuthTokens({
                username: validatedData.data.username,
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


            if (!refreshTokenAndUserDevice) return returnFailServerError(500, {
                message: "Failed to create user device"
            });


            console.log(`User:`, structuredClone(newUser), `created with refresh token:`, structuredClone(refreshTokenAndUserDevice));

            TokensUtility.ensureAuthTokenCookie(cookies, authTokens, "password");

            return redirect(307, "/");

        }

    }


    static handlePasswordLoginSubmission(): Action {
        return async ({ request, locals, cookies }) => {

            const regData = Object.fromEntries(await request.formData());

            /* Check if device token is okay */
            // const deviceToken = TokensUtility.validateDeviceTokenCookie(cookies);
            const deviceToken = locals.device_token;
            if (!deviceToken) return returnFailClientError(400, {
                // Make the page reload or invalidate all
                message: "Device token not found. Cookie issue. Reload the page"
            });


            /* Check if user exists with that username or email */

            const validatedData = userLoginSchema.safeParse(regData);
            if (!validatedData.success) {
                return fail(400, {
                    success: false,
                    errors: structuredClone(validatedData.error.errors)
                })
            }

            /* check if user exists with the provider,providerEmail */

            const passProvider = await AuthProvidersUtility.getProviderByEmailAndName(validatedData.data.email, "password", true);
            let errors = []

            /* return error if not  exists */

            if (!passProvider) {
                // check if other provider exists
                const otherProviders = await AuthProvidersUtility.getByProviderEmail(validatedData.data.email, true);
                if (otherProviders.length > 0) {
                    errors.push({ path: ["email"], message: "Password provider is not set for this user" });
                    return returnFailClientError(400, errors)
                }
                errors.push({ path: ["email"], message: "No user found with email" });

                return returnFailClientError(404, errors)
            }

            /* user exists here, check for password */

            const passValid = await PasswordAuthHelper.comparePassword(validatedData.data.password, passProvider.passwordHash as string);
            if (!passValid) {
                errors.push({ path: ["password"], message: "Password is incorrect" });
                return returnFailClientError(400, errors)
            }



            // create a new refresh token 
            const authTokens = TokensUtility.generateAuthTokens({
                username: passProvider?.user?.username as string,
                id: passProvider?.user?.id as string,
            });



            const cleanedOldDeviceAndRefeshToken = await UserDeviceUtility.deleteIfExistsByUserAndDeviceToken(passProvider.user.id as string, deviceToken as string);
            console.log("Cleaned old device and refresh token", structuredClone(cleanedOldDeviceAndRefeshToken));


            // create a new user device
            const refreshAndDeviceData = {
                userId: passProvider?.user?.id,
                refreshToken: authTokens.refreshToken,
                UserDevice: {
                    create: {
                        userId: passProvider?.user?.id,
                        deviceToken: deviceToken ?? "",
                        deviceDataJson: `{"todo": "not implemented"}`,
                    }
                }
            }
            const refreshTokenAndUserDevice = await RefreshTokenUtility.create(refreshAndDeviceData);


            if (!refreshTokenAndUserDevice) return returnFailServerError(500, {
                message: "Failed to create refresh token and user device"
            });


            console.log(`User:`, structuredClone(passProvider?.user), `logged in with refresh token:`, structuredClone(refreshTokenAndUserDevice));

            // set auth cookies
            TokensUtility.ensureAuthTokenCookie(cookies, authTokens, "password");

            return redirect(307, "/");

        }
    }


    static handleGoogleAuthSubmission(): Action {
        return async ({ request, locals, cookies, url }) => {
            const provider = "google";
            const siteUrl = url.origin;
            console.log(GOOGLE_CLIENT_ID,
                GOOGLE_CLIENT_SECRET,
                siteUrl + OAUTH_REDIRECT + `/?provider=${provider}`,
                "request hobe");

            const authUrl = await GoogleOauthHelpers.generateGoogleAuthUrl(siteUrl);
            // return redirect(307, authorizationUrl);
            return {
                success: true,
                authUrl
            };
        };
    }



    /**
     * 
     * @param userEmail string
     * @param userLoggedIn boolean
     * @param thePageRequestedFrom OauthPageRequestedFromPage
      */
    static async getOauthActionAndResponseType(provider: oAuthProviders, userEmail: string, userLoggedIn: boolean, thePageRequestedFrom: OauthPageRequestedFromPage): Promise<{ OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES, OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS, userExistsWithProvider?: any, userExistsWithOtherProvider?: any }> {
        // console.log("thePage", thePageRequestedFrom);

        // if (userLoggedIn && thePageRequestedFrom === "link") {
        //     return OAUTH_CALLBACK_ACTIONS.LINK;
        // }

        if (userLoggedIn) {
            return {
                OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES.SUCCESS_REDIRECT,
                OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS.LINK,
            }
        }


        /**
         * Speggetti code
         */
        const userExistsWithProvider = await AuthProvidersUtility.getProviderByEmailAndName(userEmail, provider, true);

        const userExistsWithOtherProvider = await AuthProvidersUtility.getByProviderEmail(userEmail, true);

        if (userExistsWithProvider) {
            console.log("userExistsWithProvider", userExistsWithProvider);
            return {
                OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES.SUCCESS_REDIRECT,
                OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS.LOGIN,
                userExistsWithProvider

            };
        }

        if (userExistsWithOtherProvider) {
            console.log("userExistsWithOtherProvider", userExistsWithOtherProvider);
            return {
                OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES.CONFIRM,
                OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS.MERGE,
                userExistsWithOtherProvider
            }
        }

        // new user here
        if (thePageRequestedFrom === "register") {
            return {
                OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES.SUCCESS_REDIRECT,
                OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS.REGISTER,

            }
        }
        if (thePageRequestedFrom === "login") {
            return {
                OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES.CONFIRM,
                OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS.REGISTER,
            }
        }

        return {
            OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES.SHOW_ERROR,
            OAUTH_CALLBACK_ACTION: OAUTH_CALLBACK_ACTIONS.NONE,
        }

    }

    static returnWithErrorMessage(message: string) {
        return {
            OAUTH_CALLBACK_RESPONSE: AUTH_RESPONSES.SHOW_ERROR,
            message
        }
    }

    static async loginUserWithOauth(cookies: Cookies, locals: App.Locals, user: User, provider: oAuthProviders) {


        // log user in
        const authTokens = TokensUtility.generateAuthTokens({ username: user.username, id: user.id });

        const refreshAndDeviceData = {
            userId: user.id,
            refreshToken: authTokens.refreshToken,
            UserDevice: { create: { userId: user.id, deviceToken: locals.device_token ?? "", deviceDataJson: `{"todo": "not implemented"}`, } }
        }

        // if user device exists, delete that
        await UserDeviceUtility.deleteIfExistsByUserAndDeviceToken(user.id, locals.device_token ?? "");

        const refreshTokenAndUserDevice = await RefreshTokenUtility.create(refreshAndDeviceData);


        if (!refreshTokenAndUserDevice) throw new Error("Could not create refresh token and user device. Please try again.");

        TokensUtility.ensureAuthTokenCookie(cookies, authTokens, provider);


    }



}


export class PasswordAuthHelper {
    static async hashPassword(password: string) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }



    // hash password


    // compare password

    static async comparePassword(password: string, encryptedPassword: string) {
        const isMatch = await bcrypt.compare(password, encryptedPassword);
        return isMatch;
    }

}

export class GoogleOauthHelpers {

    static async generateGoogleAuthUrl(siteUrl: string) {
        const oauth2Client = await GoogleOauthHelpers.getGoogleOauth2Client(siteUrl);
        const scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ];

        return oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            /** Pass in the scopes array defined above.
              * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
            scope: scopes,
            // Enable incremental authorization. Recommended as a best practice.
            // include_granted_scopes: true
        });
    }

    static async getGoogleOauth2Client(siteUrl: string) {
        const provider = "google"
        return new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            siteUrl + OAUTH_REDIRECT + `/?provider=${provider}`
        );
    }

}