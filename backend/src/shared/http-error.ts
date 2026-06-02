const errorNames: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  415: "Unsupported Media Type",
  422: "Unprocessable Entity",
  429: "Too Many Requests",
  500: "Internal Server Error"
};

export class HttpError extends Error {
  statusCode: number;
  error: string;

  constructor(statusCode: number, message: string, error = errorNames[statusCode] ?? "Error") {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
}
