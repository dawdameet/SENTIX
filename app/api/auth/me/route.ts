import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const tokenPayload = await getUserFromRequest(request);
  if (!tokenPayload) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const user = db.findUserById(tokenPayload.userId);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
  });
}
