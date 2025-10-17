import { NextRequest } from "next/server";
import { mockDb } from "@/lib/mock-data";
import { ingestSchema } from "@/lib/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ station: string }> },
) {
  const { station } = await params;
  const json = await request.json().catch(() => null);
  if (!json) {
    return Response.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = ingestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.station !== station) {
    return Response.json(
      {
        error: `Station mismatch: URL expects ${station}, payload provided ${parsed.data.station}.`,
      },
      { status: 400 },
    );
  }

  mockDb.ingestInspection({
    id: `insp-${Date.now()}`,
    ...parsed.data,
  });

  return Response.json({ ok: true });
}
