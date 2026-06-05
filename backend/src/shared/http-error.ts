const errorNames: Record<number, string> = {
  400: "ValidationError",
  401: "UnauthorizedError",
  403: "ForbiddenError",
  404: "NotFoundError",
  405: "MethodNotAllowedError",
  406: "NotAcceptableError",
  409: "ConflictError",
  415: "UnsupportedMediaTypeError",
  422: "UnprocessableEntityError",
  429: "TooManyRequestsError",
  500: "BackendFault"
};

export class HttpError extends Error {
  statusCode: number;
  error: string;
  details?: unknown[];

  constructor(statusCode: number, message: string, error = errorNames[statusCode] ?? "Error", details?: unknown[]) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
  }
}

export function getErrorName(statusCode: number) {
  return errorNames[statusCode] ?? "Error";
}
