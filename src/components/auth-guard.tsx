"use client";

import { ReactNode, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Role } from "@/lib/types";

type AuthGuardProps = {
  children: ReactNode;
  allow?: Role[];
};

export function AuthGuard({
  children,
  allow = ["viewer", "qa_engineer", "admin"],
}: AuthGuardProps) {
  const { status, data } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn(undefined, { callbackUrl: pathname || "/overview" });
    }
  }, [status, pathname]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Checking access...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const userRole = data?.user?.role ?? "viewer";

  if (!allow.includes(userRole)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 text-slate-200">
        <h2 className="text-xl font-semibold">Access restricted</h2>
        <p className="text-sm text-slate-400 max-w-sm text-center">
          Your role <span className="font-semibold">{userRole}</span> does not
          have permission to view this area of the dashboard.
        </p>
        <button
          className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 transition"
          onClick={() => router.push("/overview")}
        >
          Go back to Overview
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
