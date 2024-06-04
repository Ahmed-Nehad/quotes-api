import { Hono } from "hono";
import { Variables } from "../variables";
import auth from "../middlewares/auth";
import { zValidator } from "@hono/zod-validator";
import { userSignupSchema, userUpdatenSchema } from "../schemas/userSchema";
import { createUser, deleteUserByEmail, deleteUserById, getAllUsers, getUserByEmail, updatetUserByEmail, updatetUserById } from "../database/users";
import { generateTokens } from "../handllers/tokens";

const app = new Hono<{ Variables: Variables }>().basePath('/users');

app.use(auth)

app.post('/', zValidator('json', userSignupSchema), async (c) => {

    if(c.get('role') === 'USER') c.body(null, 403)

    const user = c.req.valid('json')
    const tokens = await generateTokens(user.email, user.role)

    await createUser(user, tokens.refreshToken)

    return c.json({user, token: tokens.token}, 201)
})

app.get('/', async (c) => {

    if(c.get('role') === 'USER'){
        const email = c.get('email')!

        const user  = await getUserByEmail(email)

        return c.json(user)
    }

    const { id, email } = c.req.query()

    const res = await getAllUsers({ id, email })

    return c.json(res)
})

app.patch('/', zValidator('json', userUpdatenSchema), async (c) => {

    const user = c.req.valid('json')

    if(c.get('role') === 'USER'){
        const email = c.get('email')!

        const dbuser  = await updatetUserByEmail(email, user)

        return c.json(dbuser)
    }

    const { id, email } = c.req.query()

    if(!id && !email) return c.json({ message: 'You need to include the id query or the email query' }, 400)

    let res

    if(email) res = await updatetUserByEmail(email, user)
    else res = await updatetUserById(id, user)

    return c.json(res)
})

app.delete('/', async (c) => {

    if(c.get('role') === 'USER'){
        const email = c.get('email')!

        await deleteUserByEmail(email)

        return c.body(null, 204)
    }

    const { id, email } = c.req.query()

    if(!id && !email) return c.json({ message: 'You need to include the id query or the email query' }, 400)
        
    if(email) await deleteUserByEmail(email)
    else await deleteUserById(id)

    return c.body(null, 204)
})

export default app