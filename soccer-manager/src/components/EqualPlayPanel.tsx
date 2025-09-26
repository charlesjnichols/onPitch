import { useMemo } from "react";
import { useAppStore } from "../store";
import { formatClock } from "../utils/time";

export default function EqualPlayPanel() {
  const roster = useAppStore((s) => s.roster);
  const getLiveMinutesSec = useAppStore((s) => s.getLiveMinutesSec);

  const stats = useMemo(() => {
    const msList = roster.map((p) => getLiveMinutesSec(p.id));
    const avg = msList.length
      ? msList.reduce((a, b) => a + b, 0) / msList.length
      : 0;
    const withMs = roster.map((p) => ({ ...p, ms: getLiveMinutesSec(p.id) }));
    const onField = withMs
      .filter((p) => p.isOnField)
      .sort((a, b) => b.ms - a.ms);
    const bench = withMs
      .filter((p) => !p.isOnField)
      .sort((a, b) => a.ms - b.ms);
    return { avg, withMs, onField, bench };
  }, [roster, getLiveMinutesSec]);

  const suggestOut = stats.onField[0];
  const suggestIn = stats.bench[0];

  return (
    <div className="space-y-3">
      <div className="text-sm text-neutral-300">
        Team average:{" "}
        <span className="font-semibold">{formatClock(stats.avg)}</span>
      </div>
      <div className="grid gap-2">
        {stats.withMs.map((p) => (
          <div
            key={p.id}
            className={`flex items-center justify-between rounded-md border p-2 ${p.ms < stats.avg ? "border-amber-700 bg-amber-900/10" : "border-neutral-800 bg-neutral-900/40"}`}
          >
            <div className="text-sm">
              {p.number ? `#${p.number} ` : ""}
              {p.name}
            </div>
            <div
              className={`text-xs tabular-nums ${p.ms < stats.avg ? "text-amber-300" : "text-neutral-400"}`}
            >
              {formatClock(p.ms)}
            </div>
          </div>
        ))}
      </div>

      {suggestOut && suggestIn && (
        <div className="rounded-lg border border-emerald-700 bg-emerald-900/10 p-3 text-sm">
          Suggestion: sub OUT{" "}
          <span className="font-semibold">{suggestOut.name}</span> (
          {formatClock(suggestOut.ms)}) and sub IN{" "}
          <span className="font-semibold">{suggestIn.name}</span> (
          {formatClock(suggestIn.ms)}).
        </div>
      )}
    </div>
  );
}
