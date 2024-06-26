import prisma, { Prisma } from ".";
import { generateApiKey } from "../handllers/apiKeys";
import { userSignupType } from "../schemas/userSchema";
import { getDefaultPlan } from "./plans";

export const createUser = async (user: userSignupType) => {
    
    const defaultPlan = await getDefaultPlan()

    if(!defaultPlan) throw new Error('There is no default plan. Please set a plan to default.')

    const { name, email, password } = user;
    return prisma.user.create({ data: {
        name,
        email,
        password,
        refreshToken: '',
        apiKey: generateApiKey(),
        plan: { connect: { name: defaultPlan.name } },
        subscriptionId: ''
    } })
}

export const getAllUsers = async (where?: Prisma.UserWhereInput) => prisma.user.findMany({where});

export const getUserById = async (id: string) => prisma.user.findUnique({where: {id}});

export const getUserByEmail = async (email: string) => prisma.user.findUnique({where: {email}});

export const getUserByRefreshToken = async (refreshToken: string) => prisma.user.findFirst({where: {refreshToken}})

export const getUserByApiKey = async (apiKey: string) => prisma.user.findFirst({
    where: {apiKey}, 
    select: {
        id: true,
        noCalls: true,
        payDate: true,
        plan: {
            select: {
                maxCalls: true,
            }
        }
    }
})

export const getUserBySubscriptionId = async (subscriptionId: string) => prisma.user.findFirst({
    where: { subscriptionId }, 
    select: { id: true }
})

export const updatetUserById = async (id: string, data: Prisma.UserUpdateInput) => prisma.user.update({data, where: {id}});

export const updatetUserByEmail = async (email: string, data: Prisma.UserUpdateInput) => prisma.user.update({data, where: {email}});

export const deleteUserById = async (id: string) => prisma.user.delete({where: {id}});

export const deleteUserByEmail = async (email: string) => prisma.user.delete({where: {email}});