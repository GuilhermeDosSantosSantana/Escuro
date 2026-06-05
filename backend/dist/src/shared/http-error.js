const errorNames = {
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
    statusCode;
    error;
    details;
    constructor(statusCode, message, error = errorNames[statusCode] ?? "Error", details) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.details = details;
    }
}
export function getErrorName(statusCode) {
    return errorNames[statusCode] ?? "Error";
}
