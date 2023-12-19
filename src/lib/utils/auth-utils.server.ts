import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OAUTH_REDIRECT } from "$env/static/private";
import prisma from "$lib/server/prisma";
import { RSAKey } from "$lib/server/rsa-key";
import type { OauthCredentials } from "@prisma/client";
import { google } from "googleapis";
import { RSAKeyError } from "./error-utils.server";



export async function findUniqueUserWithID(id: string) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id
            },
            include: {
                oauthCredentials: true
            }

        })
        if (user) {
            return user;
        }

        throw new Error("User not found");
    } catch (e) {
        console.log(e);
        return null
    }
}
export async function getTempUser(id: string) {
    try {
        const user = await prisma.tempUser.findUnique({
            where: { id }

        });

        return user;
    } catch (e) {
        return null;
    }
}

export async function findTempUserWithEmail(email: string) {
    try {
        const user = await prisma.tempUser.findUnique({
            where: { email }

        });

        return user;
    } catch (e) {
        return null;
    }
}

export async function createTempUser(data: any) {
    try {
        const user = await prisma.tempUser.create({
            data: data

        });

        return user;
    } catch (e) {
        return null;
    }
}

export async function deleteTempUser(id: string) {
    try {
        const user = await prisma.tempUser.delete({
            where: { id }

        });

        return user;
    } catch (e) {
        return null;
    }
}

export async function findUsersWithEmailOrUsername({
    email,
    username,
    oProviders,
}: {
    email?: string,
    username?: string,
    oProviders?: boolean

} = {
        email: "",
        username: "",
        oProviders: false
    }) {
    try {

        if (!email && !username) {
            throw new Error("No email or username provided");
        };

        let users: any[] = [];

        if (email && username) {
            users = await prisma.user.findMany({
                where: {
                    OR: [{ username }, { email }]
                },
                include: {
                    oauthCredentials: oProviders
                }
            });
        } else if (email) {
            users = await prisma.user.findMany({
                where: {
                    email
                },
                include: {
                    oauthCredentials: oProviders
                }
            });

        } else if (username) {
            users = await prisma.user.findMany({
                where: {
                    username
                },
                include: {
                    oauthCredentials: oProviders
                }
            });
        }


        return users;
    } catch (err) {
        console.log(err);
    }
}

export async function createOAuthCredentials(data: OauthCredentials) {
    await prisma.oauthCredentials.create({
        data: data
    })
}

export async function updateOAuthCredentials(providerId: string, data: OauthCredentials) {
    await prisma.oauthCredentials.update({
        where: {
            id: providerId
        },
        data: data
    })
    // find oauth cred by id
    // update refresh token
    // return updated oauth cred

}



///

export async function getGoogleOauth2Client(siteUrl: string) {
    const provider = "google"
    return new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        siteUrl + OAUTH_REDIRECT + `/?provider=${provider}`
    );

}


export async function generateGoogleAuthUrl(siteUrl: string) {
    const oauth2Client = await getGoogleOauth2Client(siteUrl);
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


export async function parseRVKeyAndGetTempUser(rvkey: string, dfCookie: string) {
    const decrypted = RSAKey.decrypt(rvkey as string);
    const { temp_user_id, expiresAt } = JSON.parse(decrypted);

    if (expiresAt < Date.now()) {
        throw new RSAKeyError("Invalid rvkey. Expired");
    }

    if (!temp_user_id) {
        throw new RSAKeyError("Invalid rvkey. Payload data missing");
    }

    const tempUser = await getTempUser(temp_user_id);

    if (!tempUser) {
        throw new RSAKeyError("Invalid rvkey. Temp user not found");
    }

    if (!dfCookie) {
        throw new RSAKeyError("Device fingerprint cookie not found");
    }

    if (tempUser.deviceFingerprint !== dfCookie) {
        throw new RSAKeyError("Device fingerprint mismatch");
    }

    return tempUser;
}