import { Suspense } from "react";
import { LiveMonitorDashboard } from "./_components/live-monitor-dashboard";

export const dynamic = "force-dynamic";

export default function LiveMonitorPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Loading live monitor...</div>}>
      <LiveMonitorDashboard />
    </Suspense>
  );
}
