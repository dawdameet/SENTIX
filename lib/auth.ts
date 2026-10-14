import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { JWTPayload } from "./types";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "twitter-sentiment-secret-key-32-chars-min-ok!";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const TOKEN_EXPIRY = "7d";
export const AUTH_COOKIE_NAME = "token";

export async function createToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getUserFromRequest(request: Request): Promise<JWTPayload | null> {
  // 1. Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const user = await verifyToken(token);
      if (user) return user;
    }
  }

  // 2. Check Cookie header
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce((acc, c) => {
      const [k, v] = c.trim().split("=");
      if (k && v) acc[k] = decodeURIComponent(v);
      return acc;
    }, {} as Record<string, string>);

    if (cookies[AUTH_COOKIE_NAME]) {
      const user = await verifyToken(cookies[AUTH_COOKIE_NAME]);
      if (user) return user;
    }
  }

  return null;
}
