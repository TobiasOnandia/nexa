import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookie = await cookies();
  try {
    const payload = await verifyToken(cookie);
    console.log("payload", payload);
    return NextResponse.json({
      success: true,
      message: "User authenticated successfully",
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
    });
  } catch (error) {
    return NextResponse.json({
      error: "Invalid token",
      success: false,
      userId: null,
    });
  }
}
