import prisma, { Prisma } from ".";
import 'dotenv/config'

export const createPlan = async (data: Prisma.PlanCreateInput) => prisma.plan.create({ data })

export const getPlans = async (where?: Prisma.PlanWhereInput) => prisma.plan.findMany({ where })

export const getPlanByName = async (name: string) => prisma.plan.findUnique({ where: {name} })

export const getDefaultPlan = async () => {
    let plan = await prisma.plan.findFirst({ where: { default: true } })

    if(!plan) {
        plan = await createPlan({ 
            annuallyCost: 0, 
            annuallyPlanId: '', 
            maxCalls: +process.env.FREE_PLAN_MAX_CALLS!, 
            monthlyCost: 0, 
            monthlyPlanId: '', 
            name: 'free', 
            default: true 
        })
    }

    return plan
}

export const updatePlanByName = async (name: string, data: Prisma.PlanUpdateInput) => prisma.plan.update({ data, where: {name} })

export const deletePlanByName = async (name: string) => prisma.plan.delete({ where: {name} })