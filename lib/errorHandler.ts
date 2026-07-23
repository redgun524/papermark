import { NextApiResponse } from "next";

// Error-handling policy: always sanitize errors before returning them so we never
// leak stack traces or internal fields to clients; unknown errors fall back to 500.
function sanitizeError(err: unknown) {
  if (!(err instanceof Error)) {
    return { name: typeof err, message: String(err) };
  }

  const anyErr = err as Error & { code?: unknown; requestId?: unknown };
  return {
    name: err.name,
    message: err.message,
    code: anyErr.code,
    requestId: anyErr.requestId ?? null,
    stack: err.stack ? err.stack.split("\n")[0] : undefined,
  };
}

export function errorhandler(err: unknown, res: NextApiResponse) {
  if (err instanceof TeamError || err instanceof DocumentError) {
    return res.status(err.statusCode).end(err.message);
  } else {
    console.error("[errorhandler] unhandled error", sanitizeError(err));
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

export class TeamError extends Error {
  statusCode = 400;
  constructor(public message: string) {
    super(message);
  }
}

export class DocumentError extends Error {
  statusCode = 400;
  constructor(public message: string) {
    super(message);
  }
}
