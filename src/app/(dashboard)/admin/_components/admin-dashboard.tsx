"use client";

import { useState } from "react";
import { mockUsers } from "@/lib/auth-options";

type ToleranceConfig = {
  misalignment: number;
  torque: number;
  printQuality: number;
};

type StorageConfig = {
  provider: "S3" | "MinIO" | "Local";
  endpoint: string;
  bucket: string;
};

const defaultTolerances: ToleranceConfig = {
  misalignment: 5,
  torque: 2,
  printQuality: 0.8,
};

const defaultStorage: StorageConfig = {
  provider: "S3",
  endpoint: "https://s3.mock.local",
  bucket: "hvac-inspections",
};

export function AdminDashboard() {
  const [tolerances, setTolerances] =
    useState<ToleranceConfig>(defaultTolerances);
  const [storage, setStorage] = useState<StorageConfig>(defaultStorage);
  const [message, setMessage] = useState<string | null>(null);

  function handleToleranceChange(key: keyof ToleranceConfig, value: number) {
    setTolerances((prev) => ({ ...prev, [key]: value }));
    setMessage("Tolerance settings updated (mock).");
  }

  function handleStorageChange(
    key: keyof StorageConfig,
    value: string,
  ) {
    setStorage((prev) => ({ ...prev, [key]: value }));
    setMessage("Storage settings updated (mock).");
  }

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            User & Role Management
          </h2>
          <p className="text-sm text-slate-400">
            View mock assignments for viewer, QA engineer, and admin roles.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {mockUsers.map((user) => (
            <div
              key={user.id}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
            >
              <p className="text-sm font-semibold text-slate-100">
                {user.name}
              </p>
              <p className="text-xs text-slate-400">{user.email}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-cyan-300">
                {user.role}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Line: {user.line ?? "Any"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Quality Tolerances
          </h2>
          <p className="text-sm text-slate-400">
            Configure decision thresholds for misalignment, torque, and print
            quality.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          <SettingCard
            label="Misalignment (mm)"
            value={tolerances.misalignment.toString()}
            onChange={(value) =>
              handleToleranceChange("misalignment", Number(value))
            }
          />
          <SettingCard
            label="Torque Delta (Nm)"
            value={tolerances.torque.toString()}
            onChange={(value) =>
              handleToleranceChange("torque", Number(value))
            }
          />
          <SettingCard
            label="Print Quality Score"
            value={tolerances.printQuality.toString()}
            onChange={(value) =>
              handleToleranceChange("printQuality", Number(value))
            }
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            NG Mapping
          </h2>
          <p className="text-sm text-slate-400">
            Reference mapping for NG codes and severities.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {NG_MAPPING.map((map) => (
            <div
              key={map.code}
              className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300"
            >
              <p className="font-semibold text-slate-100">{map.code}</p>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                {map.category}
              </p>
              <p className="mt-2 text-xs text-slate-300">
                Severity:{" "}
                <span className="font-semibold text-rose-300">
                  {map.severity}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-400">{map.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Storage Configuration
          </h2>
          <p className="text-sm text-slate-400">
            Mock endpoint set for presigned image URLs.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide text-slate-400">
              Provider
            </label>
            <select
              value={storage.provider}
              onChange={(event) =>
                handleStorageChange(
                  "provider",
                  event.target.value as StorageConfig["provider"],
                )
              }
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              <option value="S3">S3</option>
              <option value="MinIO">MinIO</option>
              <option value="Local">Local</option>
            </select>
          </div>
          <SettingCard
            label="Endpoint"
            value={storage.endpoint}
            onChange={(value) => handleStorageChange("endpoint", value)}
          />
          <SettingCard
            label="Bucket"
            value={storage.bucket}
            onChange={(value) => handleStorageChange("bucket", value)}
          />
        </div>
      </section>

      {message ? (
        <div className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 p-3 text-xs text-cyan-200">
          {message}
        </div>
      ) : null}
    </div>
  );
}

function SettingCard({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
      />
    </div>
  );
}

const NG_MAPPING = [
  {
    code: "SCR_MISSING",
    category: "Screw",
    severity: "major",
    description: "Detected screw count below expected threshold.",
  },
  {
    code: "SCR_WRONG_TYPE",
    category: "Screw",
    severity: "minor",
    description: "Fastener type mismatch against MES reference.",
  },
  {
    code: "LBL_MISSING",
    category: "Label",
    severity: "major",
    description: "Label not detected at required position.",
  },
  {
    code: "LBL_MISREAD",
    category: "Label",
    severity: "major",
    description: "OCR string mismatch versus MES model code.",
  },
  {
    code: "DRW_MISALIGN",
    category: "Drawing",
    severity: "critical",
    description: "Drawing misalignment exceeded tolerance.",
  },
  {
    code: "COS_SCRATCH",
    category: "Cosmetic",
    severity: "minor",
    description: "Surface scratch detected on casing.",
  },
] as const;
