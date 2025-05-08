import { jwtVerify, type JWTPayload } from "jose";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

interface UserJWTPayload extends JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export async function verifyToken(
  cookies: ReadonlyRequestCookies
): Promise<UserJWTPayload> {
  const token = cookies.get("token")?.value;

  if (!token) {
    throw new Error("No token found");
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as UserJWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);

    throw new Error("Invalid token");
  }
}
