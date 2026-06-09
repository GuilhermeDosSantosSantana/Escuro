export function extractBearerToken(authorization) {
    const match = authorization?.match(/^\s*Bearer\s+(.+)\s*$/i);
    return match?.[1]?.trim();
}
export function extractBearerTokenFromRequest(request) {
    return extractBearerToken(request.headers.authorization);
}
