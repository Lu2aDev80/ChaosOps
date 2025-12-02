type Level = 'error' | 'warn' | 'info' | 'debug'

const levelOrder: Record<Level, number> = { error: 0, warn: 1, info: 2, debug: 3 }
const envLevel = (process.env.LOG_LEVEL as Level) || 'info'
const minLevel = levelOrder[envLevel] ?? levelOrder.info

function log(level: Level, msg: string, meta?: unknown) {
  if (levelOrder[level] <= minLevel) {
    if (meta !== undefined) {
      // eslint-disable-next-line no-console
      console[level](`[${level}] ${msg}`, meta)
    } else {
      // eslint-disable-next-line no-console
      console[level](`[${level}] ${msg}`)
    }
  }
}

export const logger = {
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  debug: (msg: string, meta?: unknown) => log('debug', msg, meta),
}
