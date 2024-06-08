import { Hono } from "hono";
import { Variables } from "../variables";
import { getUserByApiKey, updatetUserByEmail, updatetUserById } from "../database/users";
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

app.get('/', limiter, async (c, next) => {
    const { key, category, author } = c.req.query()

    if(!key) return next()

    const [user, quote] = await Promise.all([getUserByApiKey(key), getRandomQuote(category, author)])

    if(!user) return c.json({ message: 'Invalid apiKey' }, 401)

    if(user.noCalls >= user.plan.maxCalls) return c.json({ message: `You have exceeded the max number of calls in this month. waith until ${user.payDate.toISOString()} or upgrade your plan` }, 403)

    if(!quote) return c.json({message: `Could't find any quote`}, 404)

    updatetUserById(user.id, { noCalls: user.noCalls + 1 })

    return c.json(quote)
})

const testing = process.env.NODE_ENV == 'test';

if(!testing) app.use(auth)

app.post('/', zValidator('json', createQuoteSchema), async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const quote = c.req.valid('json')

    const category = await getCategoryByName(quote.categoryName)

    if(!category) return c.json({ message: `Could't find any category with this name` }, 404)

    if('customError' in category && 'status' in category) return c.json({ message: category.customError }, category.status as any)

    const data = {...quote} as any
    delete data.categoryName

    const dbQuote = await createQuote({...data, category: { connect: category }})

    if('customError' in dbQuote && 'status' in dbQuote) return c.json({ message: dbQuote.customError }, dbQuote.status as any)

    return c.json(dbQuote, 201)
})

app.get('/', async (c) => {
    const { id } = c.req.query()

    if(c.get('role') === 'USER' && !id) return c.json({ message: 'You need to include the id query' }, 400)

    const res = await getQuotes({ id })

    if('customError' in res && 'status' in res) return c.json({ message: res.customError }, res.status as any)

    return c.json(res)
})

app.patch('/', zValidator('json', updateQuoteSchema), async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const { id } = c.req.query()

    if(!id) return c.json({ message: 'You need to include the id query' }, 400)

    const quote = c.req.valid('json')

    const dbQuote = await updateQuoteById(id, quote)
    
    if('customError' in dbQuote && 'status' in dbQuote) return c.json({ message: dbQuote.customError }, dbQuote.status as any)

    return c.json(dbQuote)
})

app.delete('/', async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const { id } = c.req.query()

    if(!id) return c.json({ message: 'You need to include the id query' }, 400)

    const res = await deleteQuoteById(id)

    if('customError' in res && 'status' in res) return c.json({ message: res.customError }, res.status as any)

    return c.body(null, 204)
})

export default app