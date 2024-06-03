import { Hono } from 'hono'
import { logger } from 'hono/logger'
import authRoute from './routes/auth'
import quotesRoute from './routes/quotes'
import authMiddelware from './middlewares/auth'

const app = new Hono();

app.use(logger());

app.route('/', authRoute);

app.route('/v1/quotes', quotesRoute);

app.use(authMiddelware);

app.get('/', c => c.text('welcome from hono'));

export default app;