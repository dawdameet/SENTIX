import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getUserFromRequest(request);

  if (!id) {
    return NextResponse.json({ error: "Analysis ID is required." }, { status: 400 });
  }

  const success = db.deleteAnalysis(id, user?.userId);

  if (!success) {
    return NextResponse.json(
      { error: "Analysis not found or permission denied." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: "Analysis removed." });
}
