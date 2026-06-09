import jwt from "jsonwebtoken";
import { config } from "./config.js";
import type { AuthUser } from "./types.js";

export function gerarAccessToken(usuario: AuthUser) {
  return jwt.sign(
    {
      id: usuario.id,
      usuario: usuario.usuario,
      perfil: usuario.perfil
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"] }
  );
}
