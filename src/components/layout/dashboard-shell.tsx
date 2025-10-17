"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Role } from "@/lib/types";
import { Menu, ShieldCheck, LogOut } from "lucide-react";
import { useState } from "react";

type DashboardShellProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  roles?: Role[];
};

const navItems: NavItem[] = [
  { label: "Overview", href: "/overview" },
  { label: "Inspections", href: "/inspections" },
  { label: "Unit Search", href: "/unit-search" },
  {
    label: "Model Metrics",
    href: "/model-metrics",
    roles: ["qa_engineer", "admin"],
  },
  { label: "Live Monitor", href: "/live-monitor" },
  { label: "Admin", href: "/admin", roles: ["admin"] },
];

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const { data } = useSession();
  const [navOpen, setNavOpen] = useState(false);

  const role = (data?.user?.role ?? "viewer") as Role;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden inline-flex items-center justify-center rounded-md border border-slate-700 p-2 hover:bg-slate-900"
            onClick={() => setNavOpen((state) => !state)}
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            <span className="text-lg font-semibold tracking-tight">
              Quality Dashboard
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="hidden text-right sm:block">
            <p className="font-medium">{data?.user?.name ?? "Unknown User"}</p>
            <p className="text-xs text-slate-400 uppercase tracking-wide">
              {role}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-900 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>

      <div className="flex">
        <aside
          className={cn(
            "w-64 shrink-0 border-r border-slate-800 bg-slate-950/80 p-6 space-y-2",
            navOpen ? "block" : "hidden lg:block",
          )}
        >
          {navItems
            .filter((item) => !item.roles || item.roles.includes(role))
            .map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-cyan-500/10 text-cyan-300"
                      : "text-slate-300 hover:bg-slate-900",
                  )}
                  onClick={() => setNavOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
        </aside>
        <main className="flex-1 overflow-x-hidden p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
