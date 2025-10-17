import { NextRequest } from "next/server";
import { exportSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);

  const parsed = exportSchema.safeParse({
    ...(json ?? {}),
    format: "pdf",
  });

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const jobId = `pdf-${Date.now()}`;

  return Response.json({
    data: {
      jobId,
      status: "queued",
      message: "PDF export request accepted (mock).",
    },
  });
}
