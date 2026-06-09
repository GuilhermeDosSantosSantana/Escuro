import "dotenv/config";
export const config = {
    port: Number(process.env.PORT ?? 3333),
    jwtSecret: process.env.JWT_SECRET ?? "escuro-dev-secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
    clientId: process.env.CLIENT_ID ?? "escuro-web",
    clientSecret: process.env.CLIENT_SECRET ?? "escuro-secret"
};
