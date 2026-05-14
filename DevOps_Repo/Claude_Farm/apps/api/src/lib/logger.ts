import pino from 'pino';
import pretty from 'pino-pretty';

const stream =
  process.env.NODE_ENV !== 'production'
    ? pretty({ colorize: true, sync: true })
    : undefined;

export const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' }, stream as any);
