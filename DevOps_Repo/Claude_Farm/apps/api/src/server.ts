import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import * as Sentry from '@sentry/node';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import { router } from './routes/index.js';
import { logger } from './lib/logger.js';

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? '*' }));
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));
app.use(rateLimit({ windowMs: 60_000, max: 500, standardHeaders: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));
app.use('/api/v1', router);

Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => logger.info({ port }, 'FarmConnect API started'));
