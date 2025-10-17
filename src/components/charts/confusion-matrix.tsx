"use client";

type ConfusionMatrixProps = {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
};

export function ConfusionMatrix({ tp, tn, fp, fn }: ConfusionMatrixProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wide mb-4">
        Confusion Matrix
      </h3>
      <div className="grid grid-cols-3 gap-2 text-sm text-slate-300">
        <div />
        <div className="text-center font-semibold text-slate-400">
          Predicted OK
        </div>
        <div className="text-center font-semibold text-slate-400">
          Predicted NG
        </div>
        <div className="flex items-center font-semibold text-slate-400">
          Actual OK
        </div>
        <div className="flex h-20 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-lg font-semibold text-emerald-300">
          {tn}
        </div>
        <div className="flex h-20 items-center justify-center rounded-lg border border-rose-500/40 bg-rose-500/10 text-lg font-semibold text-rose-300">
          {fp}
        </div>
        <div className="flex items-center font-semibold text-slate-400">
          Actual NG
        </div>
        <div className="flex h-20 items-center justify-center rounded-lg border border-amber-500/40 bg-amber-500/10 text-lg font-semibold text-amber-300">
          {fn}
        </div>
        <div className="flex h-20 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-lg font-semibold text-cyan-300">
          {tp}
        </div>
      </div>
    </div>
  );
}
