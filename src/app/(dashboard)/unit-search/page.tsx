import { Suspense } from "react";
import { UnitSearchDashboard } from "./_components/unit-search-dashboard";

export const dynamic = "force-dynamic";

export default function UnitSearchPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading unit search...</div>}>
      <UnitSearchDashboard />
    </Suspense>
  );
}
