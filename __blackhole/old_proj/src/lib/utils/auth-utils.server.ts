import { DEVICE_TOKEN_COOKIE_NAME, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MODE, OAUTH_REDIRECT } from "$env/static/private";
import prisma from "$lib/server/prisma";
import { RSAKey } from "$lib/server/rsa-key";
import { Prisma, type OauthCredentials, type PrismaClient, type RefreshToken, type User, type TempData, type TempUser, type UserDeviceTokens } from "@prisma/client";
import { google } from "googleapis";
import { RSAKeyError } from "./error-utils.server";
import { resultOrNull } from "./utils.server";
import { type Action, type Cookies } from "@sveltejs/kit";
import { ulid } from "ulid";




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


export class TempUserUtility {
    static async get(id: string) {
        return resultOrNull(async () => {
            const user = await prisma.tempUser.findUnique({
                where: { id }

            });

            return user;
        });
    }

    static async findByEmail(email: string) {
        return resultOrNull(async () => {
            const user = await prisma.tempUser.findUnique({
                where: { email }

            });

            return user;
        });
    }

    static async create(data: any) {
        return resultOrNull(async () => {
            const user = await prisma.tempUser.create({
                data: data

            });

            return user;
        });
    }

    static async delete(id: string) {
        return resultOrNull(async () => {
            const user = await prisma.tempUser.delete({
                where: { id }

            });

            return user;
        });
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


export class TempDataUtility {
    static async get(id: string) {
        return resultOrNull(async () => {
            const user = await prisma.tempData.findUnique({
                where: { id }

            });

            return user;
        });
    }

    static async create(data: TempData) {
        return resultOrNull(async () => {
            return await prisma.tempData.create({
                data: data

            });
        });
    }

    static async delete(id: string) {
        return resultOrNull(async () => {
            const user = await prisma.tempData.delete({
                where: { id }

            });

            return user;
        });
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

export class UsersUtility {
    static async get(id: string): Promise<User | null> {
        return resultOrNull(async () => {
            const user = await prisma.user.findUnique({
                where: { id }
            })
            return user;
        });
    }

    static async create(data: any): Promise<User | null> {
        return resultOrNull(async () => {
            const user = await prisma.user.create({
                data: data
            })
            return user;
        });
    }


    static async findUserByUsername(username: string, oauthCredentials: boolean = true): Promise<User | null> {
        return resultOrNull(async () => {
            return await prisma.user.findUnique({
                where: { username },
                include: { oauthCredentials }
            })
        });
    }

    static async findUserByEmail(email: string, oauthCredentials: boolean = true): Promise<User | null> {
        return resultOrNull(async () => {
            const providers = await AuthProvidersUtility.getByProviderEmail(email);
            if (providers?.length > 0) {
                // user may have multiple emails in multiple providers
                // but, there should not be any account with overlapping email in any provider
                return await prisma.user.findUnique({
                    where: { id: providers[0].userId },
                    include: { oauthCredentials }
                })
            }
        });
    }



}


export class AuthProvidersUtility {
    static async create(data: OauthCredentials) {
        return resultOrNull(async () => {
            const token = await prisma.oauthCredentials.create({
                data: data
            })
            return token;
        })
    }

    static async update(id: string, data: any) {
        return resultOrNull(async () => {
            const token = await prisma.oauthCredentials.update({
                where: {
                    id: id
                },
                data: data
            })
            return token;
        })
    }

    // TODO: rename this to findmanyByProviderEmail
    static async getByProviderEmail(providerEmail: string) {
        return resultOrNull(async () => {
            const token = await prisma.oauthCredentials.findMany({
                where: {
                    providerEmail: providerEmail
                }
            })
            return token;
        })
    }

    static async getByUserId(userId: string) {
        return resultOrNull(async () => {
            const token = await prisma.oauthCredentials.findMany({
                where: { userId: userId },
            })
            return token;
        })
    }

    static async getProviderByEmailAndName(providerEmail: string, provider: string) {
        return resultOrNull(async () => {
            const token = await prisma.oauthCredentials.findUnique({
                where: {
                    provider_providerEmail: {
                        provider,
                        providerEmail
                    }
                }
            })
            return token;
        })
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

// export async function updateRefreshToken(tokenId: string, data: any) {
//     try{
//         await prisma.refreshTokens
//     }
// }






export class RefreshTokenUtility {

    static async create(data: RefreshTokens, include?: Prisma.RefreshTokenInclude) {
        return resultOrNull(async () => {
            // const token = await prisma.refreshTokens.create({
            //     data: data
            // })
            const token = await prisma.refreshTokens.create({
                data: data,
                include: include
            })

            return token;
        })
    }
    static async update(id: string, data: any, include?: Prisma.RefreshTokenInclude) {
        return resultOrNull(async () => {
            const token = await prisma.refreshTokens.update({
                where: {
                    id: id
                },
                data: data,
                include: include
            })
            return token;
        })
    }

    static async getById(id: string) {
        return resultOrNull(async () => {
            const token = await prisma.refreshTokens.findUnique({
                where: {
                    id: id
                }
            })
            return token;
        })
    }

    static getByToken(theToken: string) {
        return resultOrNull(async () => {
            return await prisma.refreshTokens.findUnique({
                where: {
                    refreshToken: theToken,
                }
            })
        })
    }

    // refactor this
    // get by userid and device token
    static getByUserId(userId: string) {
        return resultOrNull(async () => {
            return await prisma.userDeviceTokens.findFirst({
                where: {
                    userId: userId
                }
            })

        })
    }


}

///


// Keep these inside GoogleOauthUtility -> ProviderOAuthUtility; whatever 
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
    const { temp_user_id, temp_data_id, expiresAt } = JSON.parse(decrypted);
    console.log(temp_user_id, temp_data_id, expiresAt, "decrypted");

    if (expiresAt < Date.now()) {
        throw new RSAKeyError("Invalid rvkey. Expired");
    }


    if (!dfCookie) {
        throw new RSAKeyError("Device fingerprint cookie not found");
    }


    if (!temp_user_id && !temp_data_id) {
        throw new RSAKeyError("Invalid rvkey. Payload data missing");
    }
    if (temp_user_id && temp_data_id) {
        throw new RSAKeyError("Invalid rvkey. Too many data in payload, that's suspicious");
    }

    if (temp_user_id) {
        const tempUser = await getTempUser(temp_user_id);
        if (!tempUser) {
            throw new RSAKeyError("Invalid rvkey. Temp user not found");
        }
        if (tempUser.deviceFingerprint !== dfCookie) {
            throw new RSAKeyError("Device fingerprint mismatch");
        }
        return tempUser;
    }

    if (temp_data_id) {
        const tempData: TempData = await TempDataUtility.get(temp_data_id);

        if (!tempData) {
            throw new RSAKeyError("Invalid rvkey. Temp data not found");
        }

        const tempDetails = JSON.parse(tempData.jsonStr);

        if (tempDetails.deviceFingerprint !== dfCookie) {
            throw new RSAKeyError("Device fingerprint mismatch");
        }

        return tempDetails;
    }
}




export function handleGoogleAuthSubmission(): Action {
    return async ({ request, locals, cookies, url }) => {
        const provider = "google";
        const siteUrl = url.origin;
        console.log(GOOGLE_CLIENT_ID,
            GOOGLE_CLIENT_SECRET,
            siteUrl + OAUTH_REDIRECT + `/?provider=${provider}`,
            "request hobe");

        const authUrl = await generateGoogleAuthUrl(siteUrl);
        // return redirect(307, authorizationUrl);
        return {
            success: true,
            authUrl
        };
    };
}


export class ServerSideCookieUtility {

    static getDeviceTokenCookie(cookies: Cookies) {
        try {
            return cookies.get(DEVICE_TOKEN_COOKIE_NAME);
        } catch (err) {
            return null;
        }
    }

    static generateDeviceToken() {
        return ulid();
    }

    static setDeviceToken(cookies: Cookies, token: string) {
        cookies.set(DEVICE_TOKEN_COOKIE_NAME, token, {
            path: "/",
            maxAge: 31536e3, // 10 years
            httpOnly: true,
            sameSite: "strict",
            secure: MODE ?? "DEV" ? false : true
        });
    }

}