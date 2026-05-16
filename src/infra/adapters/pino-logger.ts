import { pino, type DestinationStream, type Level, type Logger as PinoInstance } from 'pino'

import type { Logger, LogMeta } from '../interface/logger.js'

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'authorization',
])

const REDACTED = '[REDACTED]'

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact)
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      result[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? REDACTED : redact(v)
    }
    return result
  }
  return value
}

export type PinoLoggerLevel = Level | 'silent'

export type PinoLoggerOptions = {
  level?: PinoLoggerLevel
  stream?: DestinationStream
}

export class PinoLogger implements Logger {
  private readonly pinoInstance: PinoInstance

  constructor(options: PinoLoggerOptions = {}) {
    const level: PinoLoggerLevel = options.level ?? 'info'
    this.pinoInstance = options.stream === undefined ? pino({ level }) : pino({ level }, options.stream)
  }

  debug(message: string, meta?: LogMeta): void {
    this.pinoInstance.debug(redact(meta ?? {}) as object, message)
  }

  info(message: string, meta?: LogMeta): void {
    this.pinoInstance.info(redact(meta ?? {}) as object, message)
  }

  warn(message: string, meta?: LogMeta): void {
    this.pinoInstance.warn(redact(meta ?? {}) as object, message)
  }

  error(message: string, error?: Error, meta?: LogMeta): void {
    const payload: Record<string, unknown> = { ...(redact(meta ?? {}) ?? {}) }
    if (error) {
      payload['err'] = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      }
    }
    this.pinoInstance.error(payload, message)
  }
}
