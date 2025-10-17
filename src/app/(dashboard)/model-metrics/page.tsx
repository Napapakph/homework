import { Suspense } from "react";
import { ModelMetricsDashboard } from "./_components/model-metrics-dashboard";
import { AuthGuard } from "@/components/auth-guard";

export const dynamic = "force-dynamic";

export default function ModelMetricsPage() {
  return (
    <AuthGuard allow={["qa_engineer", "admin"]}>
      <Suspense fallback={<div className="text-slate-400">Loading model metrics...</div>}>
        <ModelMetricsDashboard />
      </Suspense>
    </AuthGuard>
  );
}
