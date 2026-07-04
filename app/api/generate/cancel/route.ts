import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { replicate } from "@/scripts/pipeline";

export const maxDuration = 15;

export async function POST(req: NextRequest) {
  const { job_id, prediction_id } = await req.json() as {
    job_id?:        string;
    prediction_id?: string;
  };

  if (prediction_id) {
    try {
      await replicate.predictions.cancel(prediction_id);
    } catch { /* already completed or not found — ignore */ }
  }

  if (job_id) {
    try {
      const supabase = await createSupabaseServer();
      await supabase
        .from("generations")
        .update({ status: "error", prediction_id: null, job_config: null })
        .eq("id", job_id);
    } catch { /* silent */ }
  }

  return NextResponse.json({ ok: true });
}
