type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

function formatLog(
  level: LogLevel,
  context: string,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>,
  error?: unknown,
): LogPayload {
  const payload: LogPayload = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    meta,
  };

  if (error instanceof Error) {
    payload.error = {
      message: error.message,
      stack: error.stack,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      code: (error as any).code,
    };
  } else if (error && typeof error === "object") {
    payload.error = {
      message: JSON.stringify(error),
    };
  } else if (error) {
    payload.error = {
      message: String(error),
    };
  }

  return payload;
}

export const logger = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(context: string, message: string, meta?: Record<string, any>) {
    const payload = formatLog("info", context, message, meta);
    if (process.env.NODE_ENV === "production") {
      console.log(JSON.stringify(payload));
    } else {
      console.log(`[${payload.timestamp}] [INFO] [${context}]: ${message}`, meta ?? "");
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(context: string, message: string, meta?: Record<string, any>) {
    const payload = formatLog("warn", context, message, meta);
    if (process.env.NODE_ENV === "production") {
      console.warn(JSON.stringify(payload));
    } else {
      console.warn(`[${payload.timestamp}] [WARN] [${context}]: ${message}`, meta ?? "");
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(context: string, message: string, error?: unknown, meta?: Record<string, any>) {
    const payload = formatLog("error", context, message, meta, error);
    if (process.env.NODE_ENV === "production") {
      console.error(JSON.stringify(payload));
    } else {
      console.error(`[${payload.timestamp}] [ERROR] [${context}]: ${message}`, error ?? "", meta ?? "");
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  critical(context: string, message: string, error?: unknown, meta?: Record<string, any>) {
    const payload = formatLog("error", context, `[CRITICAL] ${message}`, { ...meta, is_critical: true }, error);
    console.error(JSON.stringify(payload));
  },
};
