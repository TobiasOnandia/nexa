"use server";

import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const SALT_ROUNDS = 10;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export async function register(formData: FormData) {
  const { email, password, name } = Object.fromEntries(formData.entries()) as {
    email: string;
    password: string;
    name: string;
  };

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
      },
    });

    return {
      success: true,
      message: "User registered successfully",
      userid: user.id,
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, message: "Email already exists" };
    }
    console.error("Registration error:", error);
    throw new Error("Something went wrong");
  }
}

export async function login(formData: FormData) {
  const { email, password } = Object.fromEntries(formData.entries()) as {
    email: string;
    password: string;
  };

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (
      !user ||
      !user.passwordHash ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      return { success: false, message: "Invalid credentials" };
    }

    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(JWT_SECRET);

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Solo secure en producción (HTTPS)
      sameSite: "strict", // O 'lax' dependiendo de tus necesidades
      maxAge: 60 * 60, // Expira en 1 hora (en segundos)
      path: "/", // La cookie es válida en toda la aplicación
    });

    return {
      success: true,
      message: "Login successful",
    };
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error("Something went wrong");
  }
}

export async function logoutAction() {
  try {
    // Eliminar la cookie del token
    (await cookies()).delete("token");
    return { success: true, message: "Logout successful" };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, message: "Something went wrong during logout" };
  }
}
