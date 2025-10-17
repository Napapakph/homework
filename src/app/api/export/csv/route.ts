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

  const filters = parsed.data;

  const filtered = mockDb.inspections.filter((insp) => {
    if (filters.station && insp.station !== filters.station) return false;
    if (filters.model && insp.model !== filters.model) return false;
    if (filters.line && insp.line !== filters.line) return false;
    if (filters.result && insp.result !== filters.result) return false;
    if (filters.ngCode && insp.ngCode !== filters.ngCode) return false;
    if (filters.serial && insp.serial !== filters.serial) return false;
    if (filters.workOrder && insp.workOrder !== filters.workOrder) return false;
    return true;
  });

  const columns = [
    "serial",
    "workOrder",
    "station",
    "result",
    "ngCode",
    "severity",
    "modelVersion",
    "confidence",
    "capturedAt",
    "operator",
  ] as const;

  const header = columns.join(",");
  const rows = filtered.map((insp) =>
    columns
      .map((column) => {
        const value = insp[column] ?? "";
        return typeof value === "string" ? `"${value}"` : value.toString();
      })
      .join(","),
  );

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="inspections.csv"`,
    },
  });
}
