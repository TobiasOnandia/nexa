// app/api/auth/login/route.ts
import { NextResponse } from "next/server"; // Importa NextResponse
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma"; // Ajusta la ruta si es necesario

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET environment variable is not set");
  // En un entorno serverless, lanzar un error aquí es aceptable si la variable es CRÍTICA
}

export async function POST(request: Request) {
  // Usa el objeto Request nativo
  const { email, password } = await request.json(); // Obtener datos del cuerpo como JSON

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 }
    );
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
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET!, // Usar ! para asegurar a TypeScript que la variable existe (ya la verificamos arriba)
      { expiresIn: "1h" }
    );

    // Crear la respuesta usando NextResponse
    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    // Establecer la cookie usando la API de cookies de NextResponse
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Solo secure en producción (HTTPS)
      sameSite: "strict", // O 'lax' dependiendo de tus necesidades
      maxAge: 60 * 60, // Expira en 1 hora (en segundos)
      path: "/", // La cookie es válida en toda la aplicación
    });

    return response; // Devuelve la respuesta con la cookie
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
