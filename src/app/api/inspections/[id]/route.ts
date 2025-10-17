import { NextRequest } from "next/server";
import { mockDb } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const inspection = mockDb.getInspection(id);
  if (!inspection) {
    return Response.json(
      { error: `Inspection ${id} not found.` },
      { status: 404 },
    );
  }

  return Response.json({ data: inspection });
}
