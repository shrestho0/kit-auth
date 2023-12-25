import prisma from "$lib/server/db/prisma";
import type { OauthCredentials, Prisma, PrismaClient, RefreshToken, User, UserDevice } from "@prisma/client";
import { resultOrNull } from "./common.server";


export class UsersUtility {

    static async get(id: string): Promise<User | null> {
        return resultOrNull(async () => {
            const user = await prisma.user.findUnique({
                where: { id }
            })
            return user;
        });
    }

    static async create(data: User): Promise<User | null> {
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
                // they all must be unique
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

    static async getProviderByEmailAndName(providerEmail: string, provider: string, includeUser: boolean = false) {
        return resultOrNull(async () => {
            const token = await prisma.oauthCredentials.findUnique({
                where: {
                    provider_providerEmail: {
                        provider,
                        providerEmail
                    }
                },
                include: {
                    user: includeUser
                }
            })
            return token;
        })
    }
}


export class UserDeviceUtility {
    // static async create(data: UserDevice) {
    //     return resultOrNull(async () => {
    //         const token = await prisma.userDevice.create({
    //             data: data,
    //             include: include
    //         })
    //         return token;
    //     })
    // }

    static async delete(id: string) {
        return resultOrNull(async () => {
            const token = await prisma.userDevice.delete({
                where: {
                    id: id,
                }
            })
            return token;
        })
    }

    static async deleteByUserAndDeviceToken(userId: string, deviceToken: string) {
        return resultOrNull(async () => {
            const token = await prisma.userDevice.delete({
                where: {
                    userId_deviceToken: {
                        userId,
                        deviceToken
                    }
                },
                include: {
                    RefreshToken: true
                }
            })
            return token;
        })
    }
}

export class RefreshTokenUtility {

    static async create(data: any) {
        return resultOrNull(async () => {
            return await prisma.refreshToken.create({
                data: data
            })
        })
    }
    static async update(id: string, data: RefreshToken) {
        return resultOrNull(async () => {
            await prisma.refreshToken.update({
                where: {
                    id: id
                },
                data: data
            })
        })
    }

    static async updateByToken(token: string, data: RefreshToken) {
        return resultOrNull(async () => {
            await prisma.refreshToken.update({
                where: {
                    refreshToken: token
                },
                data: data
            })
        })
    }

    static async delete(id: string) {
        return resultOrNull(async () => {
            await prisma.refreshToken.delete({
                where: {
                    id: id
                }
            })
        })
    }

    static async deleteByToken(token: string) {
        return resultOrNull(async () => {
            return await prisma.refreshToken.delete({
                where: {
                    refreshToken: token
                }
            })
        })
    }

    static async getByRefreshToken(refreshToken: string) {
        return resultOrNull(async () => {
            const token = await prisma.refreshToken.findUnique({
                where: {
                    refreshToken: refreshToken
                }
            })
            return token;
        })
    }


}

