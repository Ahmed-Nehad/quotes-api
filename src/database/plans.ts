import prisma, { Prisma } from ".";

export const createPlan = async (data: Prisma.PlanCreateInput) => prisma.plan.create({ data })

export const getPlans = async (where?: Prisma.PlanWhereInput) => prisma.plan.findMany({ where })

export const getPlanByName = async (name: string) => prisma.plan.findUnique({ where: {name} })

export const getDefaultPlan = async () => prisma.plan.findFirst({ where: { default: true } })

export const updatePlanByName = async (name: string, data: Prisma.PlanUpdateInput) => prisma.plan.update({ data, where: {name} })

export const deletePlanByName = async (name: string) => prisma.plan.delete({ where: {name} })