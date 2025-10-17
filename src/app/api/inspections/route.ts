import { NextRequest } from "next/server";
import { mockDb } from "@/lib/mock-data";
import { inspectionsQuerySchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = inspectionsQuerySchema.safeParse(params);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = mockDb.listInspections(parsed.data);
  return Response.json(data);
}
