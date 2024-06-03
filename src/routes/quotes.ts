import { Hono } from "hono";
import { Variables } from "../variables";
import { getUserByApiKey, updatetUserByEmail } from "../database/users";
import { getRandomQuote } from "../database/quotes";

const app = new Hono<{ Variables: Variables }>();

app.get('/', async (c) => {
    const { apiKey, category, author } = c.req.query()

    if(!apiKey) return c.json({ message: 'You must have an apiKey' }, 403)

    const user = await getUserByApiKey(apiKey)

    if(!user) return c.json({ message: 'Invalid apiKey' }, 401)

    if(user.noCalls >= user.plan.maxCalls) return c.json({ message: `You have exceeded the max number of calls in this month. waith until ${user.payDate.toISOString()} or upgrade your plan` }, 403)

    const quote = await getRandomQuote(category, author)

    if(!quote) return c.json({message: `Could't find any quote`}, 404)

    await updatetUserByEmail(user.email, { noCalls: user.noCalls + 1 })

    return c.json(quote)
})

export default app