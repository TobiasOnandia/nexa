// app/api/auth/register/route.ts
import { NextResponse } from "next/server"; // Importa NextResponse del App Router
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: Request) {
  // Usa el objeto Request nativo
  const { email, password, name } = await request.json(); // Obtener datos del cuerpo como JSON

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: passwordHash,
        name: name || null,
      },
    });

    // Responder con éxito
    // Nota: En App Router, devuelves NextResponse.json con el cuerpo y un segundo argumento para las opciones (status, headers)
    return NextResponse.json(
      { message: "User registered successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
