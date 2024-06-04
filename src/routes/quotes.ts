import { Hono } from "hono";
import { Variables } from "../variables";
import { getUserByApiKey, updatetUserByEmail } from "../database/users";
import { createQuote, deleteQuoteById, getQuotes, getRandomQuote, updateQuoteById } from "../database/quotes";
import { rateLimiter } from "hono-rate-limiter";
import { keyGenerator } from "../handllers/keys";
import { zValidator } from "@hono/zod-validator";
import { createQuoteSchema, updateQuoteSchema } from "../schemas/quoteSchema";
import { getCategoryByName } from "../database/categories";
import auth from "../middlewares/auth";

const app = new Hono<{ Variables: Variables }>().basePath('/quotes');

const limiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 15m
  limit: 750,
  standardHeaders: "draft-6",
  keyGenerator
});

app.get('/', limiter, async (c) => {
    const { apiKey, category, author } = c.req.query()

    const [user, quote] = await Promise.all([getUserByApiKey(apiKey), getRandomQuote(category, author)])

    if(!user) return c.json({ message: 'Invalid apiKey' }, 401)

    if(user.noCalls >= user.plan.maxCalls) return c.json({ message: `You have exceeded the max number of calls in this month. waith until ${user.payDate.toISOString()} or upgrade your plan` }, 403)

    if(!quote) return c.json({message: `Could't find any quote`}, 404)

    updatetUserByEmail(user.email, { noCalls: user.noCalls + 1 })

    return c.json(quote)
})

app.use(auth)

app.post('/', zValidator('json', createQuoteSchema), async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const quote = c.req.valid('json')

    const category = await getCategoryByName(quote.categoryName)

    if(!category) return c.json({ message: `Could't find any category with this name` }, 404)

    await createQuote({...quote, category: { connect: category }})

    return c.json(quote, 201)
})

app.get('/', async (c) => {
    const { id } = c.req.query()

    if(c.get('role') == 'USER' && !id) return c.json({ message: 'You need to include the id query' }, 400)

    const res = await getQuotes({ id })

    return c.json(res)
})

app.patch('/', zValidator('json', updateQuoteSchema), async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const { id } = c.req.query()

    if(!id) return c.json({ message: 'You need to include the id query' }, 400)

    const quote = c.req.valid('json')

    const dbquote = await updateQuoteById(id, quote)

    return c.json({dbquote})
})

app.delete('/', async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const { id } = c.req.query()

    if(!id) return c.json({ message: 'You need to include the id query' }, 400)

    await deleteQuoteById(id)

    return c.body(null, 204)
})

export default app