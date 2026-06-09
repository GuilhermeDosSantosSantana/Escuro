import jwt from "jsonwebtoken";
import { config } from "./config.js";
export function gerarAccessToken(usuario) {
    return jwt.sign({
        id: usuario.id,
        usuario: usuario.usuario,
        perfil: usuario.perfil
    }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}
