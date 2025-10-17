import { mockDb } from "@/lib/mock-data";

export async function GET() {
  const data = mockDb.getLiveMonitorData();
  return Response.json({ data });
}
