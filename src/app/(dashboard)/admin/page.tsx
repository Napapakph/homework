import { Suspense } from "react";
import { AdminDashboard } from "./_components/admin-dashboard";
import { AuthGuard } from "@/components/auth-guard";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <AuthGuard allow={["admin"]}>
      <Suspense fallback={<div className="text-slate-400">Loading admin tools...</div>}>
        <AdminDashboard />
      </Suspense>
    </AuthGuard>
  );
}
