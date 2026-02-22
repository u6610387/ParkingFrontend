import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { Link } from "react-router-dom";

function fmtDate(d) {
  return new Date(d).toLocaleString();
}

function typeLabel(t) {
  const map = {
    car: "Car",
    motorcycle: "Motorcycle",
    ev: "EV",
    disabled: "Disabled",
    other: "Other",
  };
  return map[String(t || "").toLowerCase()] || String(t || "-");
}

function fmtDurationFromMinutes(mins) {
  const m = Number(mins);
  if (!Number.isFinite(m) || m < 0) return "-";
  if (m >= 60 * 24) return `${(m / (60 * 24)).toFixed(1)} days`;
  if (m >= 60) return `${(m / 60).toFixed(1)} hrs`;
  return `${Math.round(m)} mins`;
}

function badgeForStatus(status) {
  const s = String(status || "").toLowerCase();
  if (s === "cancelled") {
    return {
      text: "CANCELLED",
      chip: "border-red-200 bg-red-50 text-red-700",
      bar: "bg-red-500",
    };
  }
  if (s === "expired") {
    return {
      text: "EXPIRED",
      chip: "border-amber-200 bg-amber-50 text-amber-800",
      bar: "bg-amber-500",
    };
  }
  return {
    text: String(status || "-").toUpperCase(),
    chip: "border-slate-200 bg-slate-50 text-slate-700",
    bar: "bg-slate-400",
  };
}

export default function ReservationHistory() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await api("/api/reservations?mine=1");
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => {
    const normalized = (list || []).map((r) => {
      const slot = r.slot || r.slotId || null;

      const start = new Date(r.startTime).getTime();
      const end = new Date(r.endTime).getTime();

      const durationMinutes =
        r.durationMinutes ??
        (Number.isFinite(start) && Number.isFinite(end)
          ? Math.max(Math.round((end - start) / 60000), 0)
          : null);

      return {
        ...r,
        slot,
        durationMinutes,
        statusNorm: String(r.status || "").toLowerCase(),
      };
    });

    const historyOnly = normalized.filter((r) => r.statusNorm === "cancelled" || r.statusNorm === "expired");

    if (filter === "cancelled") return historyOnly.filter((r) => r.statusNorm === "cancelled");
    if (filter === "expired") return historyOnly.filter((r) => r.statusNorm === "expired");
    return historyOnly;
  }, [list, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">History</h1>
          <div className="text-sm text-slate-500">Cancelled or expired reservations</div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            className="text-sm border rounded-md px-3 py-1.5 hover:bg-white bg-slate-50"
            to="/my"
          >
            Back
          </Link>

          <button
            className="text-sm border rounded-md px-3 py-1.5 hover:bg-white bg-slate-50 disabled:opacity-50"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          className={`text-sm px-3 py-1.5 rounded-md border ${
            filter === "all"
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white hover:bg-slate-50 border-slate-200"
          }`}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={`text-sm px-3 py-1.5 rounded-md border ${
            filter === "cancelled"
              ? "bg-red-600 text-white border-red-600"
              : "bg-white hover:bg-red-50 border-slate-200"
          }`}
          onClick={() => setFilter("cancelled")}
        >
          Cancelled
        </button>

        <button
          className={`text-sm px-3 py-1.5 rounded-md border ${
            filter === "expired"
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white hover:bg-amber-50 border-slate-200"
          }`}
          onClick={() => setFilter("expired")}
        >
          Expired
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="text-sm text-slate-500">No history yet.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const slot = r.slot || {};
            const badge = badgeForStatus(r.statusNorm);

            const bookedText =
              r.durationMinutes != null ? fmtDurationFromMinutes(r.durationMinutes) : "-";

            return (
              <div
                key={r._id}
                className="bg-white border rounded-xl p-4 shadow-sm relative overflow-hidden"
              >
                <div className={`absolute left-0 top-0 h-full w-1.5 ${badge.bar}`} />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold">
                        {slot.slotCode || "(no slotCode)"}
                      </div>

                      <span className={`text-xs px-2 py-0.5 rounded-full border ${badge.chip}`}>
                        {badge.text}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      <span className="px-2 py-0.5 rounded border bg-slate-50 text-slate-700">
                        Zone: <b>{slot.zone || "-"}</b>
                      </span>
                      <span className="px-2 py-0.5 rounded border bg-slate-50 text-slate-700">
                        Type: <b>{typeLabel(slot.type)}</b>
                      </span>
                      <span className="px-2 py-0.5 rounded border bg-slate-50 text-slate-700">
                        Booked: <b>{bookedText}</b>
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-slate-600">
                      <div>
                        <span className="text-slate-500">Start:</span>{" "}
                        <b>{fmtDate(r.startTime)}</b>
                      </div>
                      <div>
                        <span className="text-slate-500">End:</span>{" "}
                        <b>{fmtDate(r.endTime)}</b>
                      </div>

                      {r.statusNorm === "expired" && (
                        <div className="mt-2 text-sm text-amber-700">
                          Time is up (expired).
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}