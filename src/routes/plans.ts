import { Hono } from "hono";
import { Variables } from "../variables";
import { zValidator } from "@hono/zod-validator";
import auth from "../middlewares/auth";
import { createPlanSchema, updatePlanSchema } from "../schemas/planSchema";
import { createPlan, deletePlanByName, getPlanByName, getPlans, updatePlanByName } from "../database/plans";
import { createProduct, createPlan as createPaypalPlan, updatePlan, deactivatePlan, cancelSubscription } from "../handllers/paypal";
import { getAllUsers, updatetUserById } from "../database/users";


const app = new Hono<{ Variables: Variables }>().basePath('/plans');

const testing = process.env.NODE_ENV == 'test';

if(!testing) app.use(auth)

app.post('/', zValidator('json', createPlanSchema), async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const plan = c.req.valid('json')

    const paypalProduct = await createProduct({ name: 'API Service', description: 'API Service' })

    if(!paypalProduct) return c.json({ message: 'unknown error happened while creating a new plan.' }, 500)
        
    const monthlyPaypalPlan = await createPaypalPlan(paypalProduct?.id!, { name: plan.name + ' monthlyPlan', description: plan.name + ' monthly plan', interval: 'MONTH', price: plan.monthlyCost })
    
    const annuallyPaypalPlan = await createPaypalPlan(paypalProduct?.id!, { name: plan.name + ' annuallyPlan', description: plan.name + ' annually plan', interval: 'YEAR', price: plan.annuallyCost })
    
    if(!monthlyPaypalPlan || !annuallyPaypalPlan) return c.json({ message: 'unknown error happened while creating a new plan.' }, 500)

    const dbPlan = await createPlan({
        ...plan, 
        annuallyPlanId: annuallyPaypalPlan?.id!, 
        monthlyPlanId: monthlyPaypalPlan?.id!
    })

    if('customError' in dbPlan && 'status' in dbPlan) return c.json({ message: dbPlan.customError }, dbPlan.status as any)

    return c.json(dbPlan, 201)
})

app.get('/', async (c) => {
    const { name } = c.req.query()

    const res = await getPlans({ name })

    if('customError' in res && 'status' in res) return c.json({ message: res.customError }, res.status as any)

    return c.json(res)
})

app.patch('/', zValidator('json', updatePlanSchema), async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const { name } = c.req.query()

    if(!name) return c.json({ message: 'You need to include the name query' }, 400)

    const plan = c.req.valid('json')

    
    const dbplan = await updatePlanByName(name, plan)
    
    if('customError' in dbplan && 'status' in dbplan) return c.json({ message: dbplan.customError }, dbplan.status as any)

    if(plan.annuallyCost) {
        const ok1 = await updatePlan(dbplan.monthlyPlanId, dbplan.monthlyCost)
        if(!ok1) return c.json({ message: 'unknown error happened while updating a new plan 1.' }, 500)
    }
    if(plan.annuallyCost){
        const ok2 = await updatePlan(dbplan.annuallyPlanId, dbplan.annuallyCost)
        if(!ok2) return c.json({ message: 'unknown error happened while updating a new plan 2.' }, 500)
    }

    return c.json(dbplan)
})

app.delete('/', async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const { name } = c.req.query()

    if(!name) return c.json({ message: 'You need to include the name query' }, 400)

    const plan = await getPlanByName(name)

    if(plan && 'customError' in plan && 'status' in plan) return c.json({ message: plan.customError }, plan.status as any)

    const ok1 = await deactivatePlan(plan?.annuallyPlanId!)
    const ok2 = await deactivatePlan(plan?.monthlyPlanId!)

    if(!ok1 || !ok2) return c.json({ message: 'unknown error happened while deleting the plan.' }, 500)

    const users = await getAllUsers({ planId: name })

    for (let i = 0; i < users.length; i++) {
        await cancelSubscription(users[i].subscriptionId, 'Cancelling due to plan deletion')
        await updatetUserById(users[i].id, { subscriptionId: '' })
    }

    const res = await deletePlanByName(name)

    if('customError' in res && 'status' in res) return c.json({ message: res.customError }, res.status as any)

    return c.body(null, 204)
})

export default app