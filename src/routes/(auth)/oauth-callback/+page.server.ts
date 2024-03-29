import type { PageServerLoad } from "./$types";
import { redirect, type Cookies, error } from "@sveltejs/kit";
import { OauthActionHelper } from "$lib/auth/helpers/oauth.server";
import { OauthCallbackHandlers } from "$lib/auth/handlers/oauth.server";
import { ServerSideCookieUtility } from "$lib/auth/utils/cookies.server";
import type { OauthPageRequestedFromPage } from "$lib/auth/types";



export const load: PageServerLoad = async ({ url, params, cookies, locals }) => {
    // if(locals.user_id && locals.user_username)
    // const paramsx = url.searchParams;
    const searchParams = Object.fromEntries(url.searchParams);
    const { provider } = searchParams;

    const thePageRequestedFrom: OauthPageRequestedFromPage = await ServerSideCookieUtility.parseAuthPageRequestedFrom(cookies);

    console.log("thePageRequestedFrom", thePageRequestedFrom);

    const userLoggedIn: boolean = ((locals?.user_id) && (locals?.user_username)) as unknown as boolean;

    if (!provider) return redirect(307, "/");

    const siteUrl = url.origin;

    switch (provider) {
        case "google":
            // return OauthActionHelper.handleGoogleOauthCallback(siteUrl, code, locals, cookies);
            return OauthCallbackHandlers.handleGoogleOauthCallback(siteUrl, searchParams, locals, cookies, userLoggedIn, thePageRequestedFrom);
        case "github":
            return OauthCallbackHandlers.handleNotImplementedOauthCallback(locals, cookies, userLoggedIn, thePageRequestedFrom);
        // error(418, {
        //     message: "github not implemented yet"
        // })
        default:
            error(418, {
                message: "not implemented"
            })

    }
};



// async function handleGoogleOauthCallback(siteUrl: string, code: string, locals: App.Locals, cookies: Cookies) {

//     // some google thingy
//     const oauth2Client = await getGoogleOauth2Client(siteUrl);
//     const { tokens } = await oauth2Client.getToken(code);
//     const gUserData = await pasrseUserDataFromGoogleIdToken(tokens.id_token as string);

//     // checking users existance

//     // const dbUser = await findUsersWithEmailOrUsername({
//     //     email: gUserData?.email as string,
//     //     oProviders: true
//     // });
//     const dbUser = await UsersUtility.findUserByEmail(gUserData?.email as string);
//     console.log(dbUser);
//     // handling old user
//     if (dbUser) {
//         const theToken = await RefreshTokenUtility.getByUserId(dbUser.id);

//         // const oauthCredProviders: any = await AuthProvidersUtility.getByProviderEmail(gUserData.email as string);
//         // const oauthCreds = oauthCredProviders?.find((cred: any) => cred.provider === "google");
//         const oauthCreds = await AuthProvidersUtility.getProviderByEmailAndName(gUserData.email as string, "google");

//         if (oauthCreds) {
//             console.log("oauth creds found");

//             const authTokens: Tokens = await generateAuthTokens({
//                 id: dbUser.id,
//                 username: dbUser.username
//             });


//             await updateOAuthCredentials(oauthCreds.id, {
//                 oauthRefreshToken: tokens.refresh_token as string,
//             } as OauthCredentials)

//             await RefreshTokenUtility.update(theToken.id, {
//                 refreshToken: authTokens.refreshToken as string
//             });






//             // console.log("setting locals");
//             locals.user_id = dbUser.id;
//             locals.user_username = dbUser.username;
//             // console.log(locals.user_id, locals.user_username,);

//             setAuthCookies(cookies, authTokens, oauthCreds.provider as oAuthProviders, true);
//             cookies.delete("_tf", {
//                 path: "/",
//             });
//             // update oauth credshandlers/
//                 status: "REDIRECT" as OAUTH_CALLBACK_RESPONSE_STATUS,
//                 type: "LOGIN" as OAUTH_CALLBACK_RESPONSE_STATUS_TYPE,
//                 location: "/",
//                 user: {
//                     id: locals.user_username,
//                     username: locals.user_id,
//                 },
//                 cookie_data: processAuthTokens({
//                     accessToken: authTokens.accessToken,
//                     refreshToken: authTokens.refreshToken
//                 }, oauthCreds.provider as oAuthProviders)

//             }

//         }


//         const userProviders = await AuthProvidersUtility.getByUserId(dbUser.id);


//         if (userProviders?.length != 0) {
//             console.log("creds found with other providers", userProviders);
//             // send oauth data like previous one to merge with



//             /**
//              * @todo test before doing
//              * 
//              * */

//             // send link account page
//             // ask for password for that account
//             // else delete data
//             // link accounts

//             const temp_temp_data = {
//                 provider: "google",
//                 gUserData,
//                 userProviders,
//                 deviceFingerprint: cookies.get("_tf") ?? "",
//             };

//             const temp_data = await TempDataUtility.create({
//                 jsonStr: JSON.stringify(temp_temp_data)
//             } as TempData)



//             if (!temp_data) {
//                 throw new Error("temp data not created");
//             }


//             const payloadString = JSON.stringify({
//                 temp_data_id: temp_data.id,
//                 expiresAt: Date.now() + 1000 * 60 * 60 * 1 // 1 hour
//             });
//             const rvkey = encodeURIComponent(RSAKey.encrypt(payloadString) ?? "");


//             return {
//                 status: "REDIRECT" as OAUTH_CALLBACK_RESPONSE_STATUS,
//                 type: "LINK_ACCOUNTS" as OAUTH_CALLBACK_RESPONSE_STATUS_TYPE,
//                 location: `/link-with-existing-account/?rvkey=${rvkey}`,

//             }
//             // update oauth creds
//             // ask to link accounts OR link link accounts
//         }
//         // if(oauthCreds)
//     } else {
//         // totally new account
//         // send user to confirm account page with some data;
//         // 

//         const newUserId = crypto.randomUUID();

//         let newUserName = gUserData.email?.split("@")[0] ?? newUserId?.split("-")[3];

//         // // find if username exists
//         // const usernameExists = await findUsersWithEmailOrUsername({
//         //     username: newUserName,
//         //     oProviders: false
//         // })

//         const usernameExists = await UsersUtility.findUserByUsername(newUserName);

//         if (usernameExists) newUserName = newUserName + newUserId?.split("-")[2];



//         let newProvider: oAuthProviders = "google";


//         const tempUserData = {
//             id: newUserId,
//             username: newUserName,

//             email: gUserData.email as string,
//             name: gUserData?.name ?? "",
//             provider: newProvider,

//             oauthIdToken: tokens.id_token,
//             oauthAccessToken: tokens.access_token as string,
//             oauthRefreshToken: tokens.refresh_token as string,
//             deviceFingerprint: cookies.get("_tf") ?? "",
//         }


//         // handling temp user duplication
//         // const existingTempUserWithEmail = await findTempUserWithEmail(tempUserData.email);
//         const existingTempUserWithEmail = await TempUserUtility.findByEmail(tempUserData.email);
//         // if (existingTempUserWithEmail) await deleteTempUser(existingTempUserWithEmail.id);
//         if (existingTempUserWithEmail) await TempUserUtility.delete(existingTempUserWithEmail.id);


//         // const tempUser = await createTempUser(tempUserData);
//         const tempUser = await TempUserUtility.create(tempUserData);



//         if (!tempUser) {
//             throw new Error("temp user not created");
//         }

//         const payloadString = JSON.stringify({
//             temp_user_id: tempUser.id,
//             expiresAt: Date.now() + 1000 * 60 * 60 * 1 // 1 hour
//         });
//         const rvkey = encodeURIComponent(RSAKey.encrypt(payloadString) ?? "");



//         return {
//             status: "REDIRECT" as OAUTH_CALLBACK_RESPONSE_STATUS,
//             type: "REGISTER" as OAUTH_CALLBACK_RESPONSE_STATUS_TYPE,
//             location: `/confirm-account/?rvkey=${rvkey}`,

//         }


//     }

//     console.log(tokens.id_token);

// }