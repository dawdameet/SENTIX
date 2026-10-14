import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);

  // History persists only for authenticated / signed up users
  if (!user) {
    return NextResponse.json({
      success: true,
      analyses: [],
      total: 0,
      authenticated: false,
    });
  }

  const analyses = db.getAnalyses(user.userId);

  return NextResponse.json({
    success: true,
    analyses,
    total: analyses.length,
    authenticated: true,
  });
}

export async function DELETE(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to clear history." },
      { status: 401 }
    );
  }

  const deletedCount = db.clearAnalyses(user.userId);

  return NextResponse.json({
    success: true,
    message: `Cleared ${deletedCount} analyses.`,
  });
}
