import { NextRequest } from "next/server";
import { mockDb } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ serial: string }> },
) {
  const { serial } = await params;
  const timeline = mockDb.getTimeline(serial);

  if (!timeline) {
    return Response.json(
      { error: `Serial ${serial} not found.` },
      { status: 404 },
    );
  }

  return Response.json({ data: timeline });
}
