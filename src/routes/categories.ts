import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createCategory, deleteCategoryByName, getCategories } from "../database/categories";
import { createCategorySchema } from "../schemas/categioySchema";
import auth from "../middlewares/auth";
import { Variables } from "../variables";


const app = new Hono<{ Variables: Variables }>().basePath('/categories');

const testing = process.env.NODE_ENV == 'test';

if(!testing) app.use(auth)

app.post('/', zValidator('json', createCategorySchema), async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const category = c.req.valid('json')

    const dbCategory = await createCategory(category)

    if('customError' in dbCategory && 'status' in dbCategory) return c.json({ message: dbCategory.customError }, dbCategory.status as any)

    return c.json(dbCategory, 201)
})

app.get('/', async (c) => {
    const { name } = c.req.query()

    const res = await getCategories({ name })

    if('customError' in res && 'status' in res) return c.json({ message: res.customError }, res.status as any)

    return c.json(res)
})

app.delete('/', async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const { name } = c.req.query()

    if(!name) return c.json({ message: 'You need to include the name query' }, 400)

    const res = await deleteCategoryByName(name)

    if('customError' in res && 'status' in res) return c.json({ message: res.customError }, res.status as any)

    return c.body(null, 204)
})

export default app