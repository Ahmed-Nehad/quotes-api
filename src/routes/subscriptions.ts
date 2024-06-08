import { Hono } from "hono";
import { Variables } from "../variables";
import auth from "../middlewares/auth";
import { getUserById, getUserBySubscriptionId, updatetUserById } from "../database/users";
import { cancelSubscription, changeSubscriptionPlan, createSubscription } from "../handllers/paypal";
import { getDefaultPlan, getPlanByName } from "../database/plans";

const app = new Hono<{ Variables: Variables }>().basePath('/subscriptions');

const testing = process.env.NODE_ENV == 'test';

app.get('/return', async (c) => {
    const { token } = c.req.query()

    if(!token) return c.json({ message: `You need to include "token" query.` }, 400)

    const user = await getUserBySubscriptionId(token);

    if(user && 'customError' in user && 'status' in user) return c.json({ message: user.customError }, user.status as any)

    if(!user) return c.json({ message: `Couldn't find any user with this id.` }, 404)

    const newUser = await updatetUserById(user.id, { active: true })

    if(newUser && 'customError' in newUser && 'status' in newUser) return c.json({ message: newUser.customError }, newUser.status as any)

    return c.body(null)
})

app.get('/cancle', async (c) => {
    const { token } = c.req.query()

    if(!token) return c.json({ message: `You need to include "token" query.` }, 400)

    const user = await getUserBySubscriptionId(token);

    if(user && 'customError' in user && 'status' in user) return c.json({ message: user.customError }, user.status as any)

    if(!user) return c.json({ message: `Couldn't find any user with this id.` }, 404)

    const defaultPlan = await getDefaultPlan()

    if(!defaultPlan) throw new Error('There is no default plan. Please set a plan to default.')

    const newUser = await updatetUserById(user.id!, { 
        subscriptionId: '',
        plan: { connect: { name: defaultPlan.name } },
        active: false
    })

    if(newUser && 'customError' in newUser && 'status' in newUser) return c.json({ message: newUser.customError }, newUser.status as any)

    return c.body(null, 204)
})

if(!testing) app.use(auth)

app.post('/subscribe/:planId', async (c) => {
    const { planId } = c.req.param()
    const { interval } = c.req.query()

    if(!interval || (interval != 'MONTH' && interval != 'YEAR')) return c.json({ message: `You need to include "interval" query and to be equal to "MONTH" or "YEAR".` }, 400)

    const plan = await getPlanByName(planId);

    if(plan && 'customError' in plan && 'status' in plan) return c.json({ message: plan.customError }, plan.status as any)

    if(!plan) return c.json({ message: `Couldn't find any plan with this name.` }, 404)

    if(c.get('role') == 'USER'){
        const id = c.get('id')

        const subscription = await createSubscription(interval == 'MONTH' ? plan.monthlyPlanId : plan.annuallyPlanId)

        const approveLink = subscription.links[0].href;

        const subscriptionId = subscription.id;

        const user = await updatetUserById(id!, { 
            subscriptionId,
            plan: { connect: { name: planId } },
            payPeriod: interval,
            active: false
        })

        if(user && 'customError' in user && 'status' in user) return c.json({ message: user.customError }, user.status as any)

        return c.json({ approveLink })
    }

    const { user_id } = c.req.query()

    if(!user_id) return c.json({ message: `You need to include "user_id" query.` }, 400)

    const user = await getUserById(user_id);

    if(user && 'customError' in user && 'status' in user) return c.json({ message: user.customError }, user.status as any)

    if(!user) return c.json({ message: `Couldn't find any user with this id.` }, 404)

    const subscription = await createSubscription(interval == 'MONTH' ? plan.monthlyPlanId : plan.annuallyPlanId)

    const approveLink = subscription.links[0].href;

    const subscriptionId = subscription.id;

    const newUser = await updatetUserById(user_id, { 
        subscriptionId,
        plan: { connect: { name: planId } },
        payPeriod: interval,
        active: false
    })

    if(newUser && 'customError' in newUser && 'status' in newUser) return c.json({ message: newUser.customError }, newUser.status as any)

    return c.json({ approveLink })
})

app.post('/change/:planId', async (c) => {
    const { planId } = c.req.param()
    const { interval } = c.req.query()

    if(!interval || (interval != 'MONTH' && interval != 'YEAR')) return c.json({ message: `You need to include "interval" query and to be equal to "MONTH" or "YEAR".` }, 400)

    const plan = await getPlanByName(planId);

    if(plan && 'customError' in plan && 'status' in plan) return c.json({ message: plan.customError }, plan.status as any)

    if(!plan) return c.json({ message: `Couldn't find any plan with this name.` }, 404)

    if(c.get('role') == 'USER'){
        const id = c.get('id')

        const user = await getUserById(id!)

        if(user && 'customError' in user && 'status' in user) return c.json({ message: user.customError }, user.status as any)

        const subscription = await changeSubscriptionPlan(user?.subscriptionId!, interval == 'MONTH' ? plan.monthlyPlanId : plan.annuallyPlanId)

        const approveLink = subscription.links[0].href;

        const subscriptionId = subscription.id;

        const newUser = await updatetUserById(id!, { 
            subscriptionId,
            plan: { connect: { name: planId } },
            payPeriod: interval,
            active: false
        })

        if(newUser && 'customError' in newUser && 'status' in newUser) return c.json({ message: newUser.customError }, newUser.status as any)

        return c.json({ approveLink })
    }

    const { user_id } = c.req.query()

    if(!user_id) return c.json({ message: `You need to include "user_id" query.` }, 400)

    const user = await getUserById(user_id);

    if(user && 'customError' in user && 'status' in user) return c.json({ message: user.customError }, user.status as any)

    if(!user) return c.json({ message: `Couldn't find any user with this id.` }, 404)

    const subscription = await changeSubscriptionPlan(user?.subscriptionId!, interval == 'MONTH' ? plan.monthlyPlanId : plan.annuallyPlanId)

    const approveLink = subscription.links[0].href;

    const subscriptionId = subscription.id;

    const newUser = await updatetUserById(user_id!, { 
        subscriptionId,
        plan: { connect: { name: planId } },
        payPeriod: interval,
        active: false
    })

    if(newUser && 'customError' in newUser && 'status' in newUser) return c.json({ message: newUser.customError }, newUser.status as any)

    return c.json({ approveLink })
})

app.post('/cancel', async (c) => {

    if(c.get('role') == 'USER'){
        const id = c.get('id')

        const user = await getUserById(id!)

        if(user && 'customError' in user && 'status' in user) return c.json({ message: user.customError }, user.status as any)

        const ok = await cancelSubscription(user?.subscriptionId!)

        if(!ok) return c.json({ message: `An unknown error happend while canceling the subscription.` }, 500)

        const defaultPlan = await getDefaultPlan()

        if(!defaultPlan) throw new Error('There is no default plan. Please set a plan to default.')

        const newUser = await updatetUserById(id!, { 
            subscriptionId: '',
            plan: { connect: { name: defaultPlan.name } },
            active: false
        })

        if(newUser && 'customError' in newUser && 'status' in newUser) return c.json({ message: newUser.customError }, newUser.status as any)

        return c.body(null, 204)
    }

    const { user_id } = c.req.query()

    if(!user_id) return c.json({ message: `You need to include "user_id" query.` }, 400)

    const user = await getUserById(user_id);

    if(user && 'customError' in user && 'status' in user) return c.json({ message: user.customError }, user.status as any)

    if(!user) return c.json({ message: `Couldn't find any user with this id.` }, 404)

    const ok = await cancelSubscription(user?.subscriptionId!)

    if(!ok) return c.json({ message: `An unknown error happend while canceling the subscription.` }, 500)

    const defaultPlan = await getDefaultPlan()

    if(!defaultPlan) throw new Error('There is no default plan. Please set a plan to default.')

    const newUser = await updatetUserById(user_id!, { 
        subscriptionId: '',
        plan: { connect: { name: defaultPlan.name } },
        active: false
    })

    if(newUser && 'customError' in newUser && 'status' in newUser) return c.json({ message: newUser.customError }, newUser.status as any)

    return c.body(null, 204)
})

export default app