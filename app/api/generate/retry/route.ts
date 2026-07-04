import { NextResponse } from "next/server";

// Retry is handled by re-submitting via /api/generate with the same parameters.
export async function POST() {
  return NextResponse.json(
    { error: "Utilisez le bouton Générer pour relancer une génération" },
    { status: 410 }
  );
}
