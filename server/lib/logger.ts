import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  // Add stack trace for errors
  if (stack) {
    log += `\n${stack}`;
  }
  
  // Add any additional metadata
  if (Object.keys(meta).length > 0) {
    log += ` ${JSON.stringify(meta)}`;
  }
  
  return log;
});

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(
    errors({ stack: true }), // Capture stack traces
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  defaultMeta: { service: 'ai-ecosystem-rolodex' },
  transports: [
    // Console transport with colors for development
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        logFormat
      )
    })
  ],
  // Don't exit on handled exceptions
  exitOnError: false
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  // Error log file
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
  
  // Combined log file
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }));
}

// Export convenience methods
export const log = {
  info: (message: string, meta?: object) => logger.info(message, meta),
  warn: (message: string, meta?: object) => logger.warn(message, meta),
  error: (message: string, meta?: object | Error) => {
    if (meta instanceof Error) {
      logger.error(message, { error: meta.message, stack: meta.stack });
    } else {
      logger.error(message, meta);
    }
  },
  debug: (message: string, meta?: object) => logger.debug(message, meta),
  http: (message: string, meta?: object) => logger.http(message, meta)
};

export default logger;

