import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const credits = searchParams.get("credits");
  return NextResponse.redirect(
    new URL(`/dashboard?payment=success&credits=${credits ?? ""}`, req.url)
  );
}
