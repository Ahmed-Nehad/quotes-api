import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createCategory, deleteCategoryByName, getCategories } from "../database/categories";
import { createCategorySchema } from "../schemas/categioySchema";
import auth from "../middlewares/auth";
import { Variables } from "../variables";


const app = new Hono<{ Variables: Variables }>().basePath('/categories');

app.use(auth)

app.post('/', zValidator('json', createCategorySchema), async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const category = c.req.valid('json')

    await createCategory(category)

    return c.json(category, 201)
})

app.get('/', async (c) => {
    const { name } = c.req.query()

    const res = await getCategories({ name })

    return c.json(res)
})

app.delete('/', async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const { name } = c.req.query()

    if(!name) return c.json({ message: 'You need to include the name query' }, 400)

    await deleteCategoryByName(name)

    return c.body(null, 204)
})

export default app