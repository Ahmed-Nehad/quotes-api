import { Hono } from "hono";
import { Variables } from "../variables";
import { zValidator } from "@hono/zod-validator";
import auth from "../middlewares/auth";
import { createPlanSchema, updatePlanSchema } from "../schemas/planSchema";
import { createPlan, deletePlanByName, getPlans, updatePlanByName } from "../database/plans";


const app = new Hono<{ Variables: Variables }>().basePath('/plans');

const testing = process.env.NODE_ENV == 'test';

if(!testing) app.use(auth)

app.post('/', zValidator('json', createPlanSchema), async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const plan = c.req.valid('json')

    const dbPlan = await createPlan(plan)

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

    return c.json(dbplan)
})

app.delete('/', async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const { name } = c.req.query()

    if(!name) return c.json({ message: 'You need to include the name query' }, 400)

    const res = await deletePlanByName(name)

    if('customError' in res && 'status' in res) return c.json({ message: res.customError }, res.status as any)

    return c.body(null, 204)
})

export default app