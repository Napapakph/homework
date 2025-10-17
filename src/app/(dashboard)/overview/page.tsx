import { Suspense } from "react";
import { OverviewDashboard } from "./_components/overview-dashboard";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading overview...</div>}>
      <OverviewDashboard />
    </Suspense>
  );
}
