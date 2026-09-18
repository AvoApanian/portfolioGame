const LEVELS = ['debug', 'info', 'warn', 'error']

function timestamp() {
  return new Date().toISOString().split('T')[1].replace('Z', '')
}

function write(level, scope, message, data) {
  const prefix = `[${timestamp()}] [${scope}]`
  if (data !== undefined) {
    console[level](prefix, message, data)
  } else {
    console[level](prefix, message)
  }
}

export const logger = LEVELS.reduce((acc, level) => {
  acc[level] = (scope, message, data) => write(level, scope, message, data)
  return acc
}, {})

export default logger
