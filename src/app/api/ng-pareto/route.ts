import { NextRequest } from "next/server";
import { mockDb } from "@/lib/mock-data";
import { summaryQuerySchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = summaryQuerySchema.safeParse(params);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = mockDb.getPareto(parsed.data);
  return Response.json({ data });
}
