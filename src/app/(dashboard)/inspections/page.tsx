import { Suspense } from "react";
import { InspectionsDashboard } from "./_components/inspections-dashboard";

export const dynamic = "force-dynamic";

export default function InspectionsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading inspections...</div>}>
      <InspectionsDashboard />
    </Suspense>
  );
}
