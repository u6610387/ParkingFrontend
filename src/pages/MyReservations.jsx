import { useEffect, useMemo, useState, useCallback } from "react";
import { api } from "../api/client";
import { Link, useNavigate } from "react-router-dom";

function fmtDate(d) {
  return new Date(d).toLocaleString();
}

function minutesBetween(a, b) {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

function formatDurationFromMinutes(mins) {
  if (mins == null) return "-";
  const m = Number(mins);
  if (!Number.isFinite(m) || m < 0) return "-";
  if (m < 60) return `${Math.round(m)} mins`;
  const hrs = m / 60;
  if (hrs < 24) return `${hrs.toFixed(1)} hrs`;
  const days = hrs / 24;
  return `${days.toFixed(1)} days`;
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

export default function MyReservations() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await api("/api/reservations?mine=1&status=active");
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const rows = useMemo(() => {
    const now = new Date(nowTick);
    return (list || []).map((r) => {
      const slot = r.slot || r.slotId || {};
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);

      const durationMins =
        r.durationMinutes != null ? r.durationMinutes : minutesBetween(start, end);

      const remainingMins =
        end.getTime() <= now.getTime()
          ? 0
          : Math.max(0, Math.round((end.getTime() - now.getTime()) / 60000));

      const isOngoing = start.getTime() <= now.getTime() && end.getTime() >= now.getTime();
      const isExpired = end.getTime() < now.getTime();

      return {
        ...r,
        slot,
        durationMins,
        remainingMins,
        isOngoing,
        isExpired,
      };
    });
  }, [list, nowTick]);

  const hasExpiredInActiveList = useMemo(() => rows.some((r) => r.isExpired), [rows]);

  useEffect(() => {
    if (!hasExpiredInActiveList) return;
    const t = setTimeout(() => {
      load().then(() => navigate("/history")).catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [hasExpiredInActiveList, load, navigate]);

  async function cancel(id) {
    setErr("");
    try {
      await api(`/api/reservations/${id}`, { method: "DELETE" });
      navigate("/history");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-xl font-semibold">My Reservations</h1>

        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className="text-sm border rounded-md px-3 py-1.5 hover:bg-slate-50"
          >
            History
          </Link>

          <button
            className="text-sm border rounded-md px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50"
            disabled={loading}
            onClick={load}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}

      {rows.length === 0 ? (
        <div className="text-sm text-slate-500">No active reservations.</div>
      ) : (
        rows.map((r) => (
          <div
            key={r._id}
            className="bg-white border rounded-xl p-4 shadow-sm flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <div className="font-semibold text-lg">
                  {r.slot?.slotCode || "(no slotCode)"}
                </div>

                {r.isOngoing && (
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                    ONGOING
                  </span>
                )}

                {r.isExpired && (
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                    EXPIRED
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="px-2 py-0.5 rounded border bg-slate-50 text-slate-700">
                  Zone: <b>{r.slot?.zone || "-"}</b>
                </span>
                <span className="px-2 py-0.5 rounded border bg-slate-50 text-slate-700">
                  Type: <b>{typeLabel(r.slot?.type)}</b>
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
              </div>

              <div className="mt-3 text-sm">
                <span className="text-slate-700">
                  Booked: <b>{formatDurationFromMinutes(r.durationMins)}</b>
                </span>

                {!r.isExpired ? (
                  <span className="text-slate-500">
                    {" "}
                    • Remaining: <b>{formatDurationFromMinutes(r.remainingMins)}</b>
                  </span>
                ) : (
                  <span className="text-amber-700"> • Time is up</span>
                )}
              </div>
            </div>

            <button
              className="px-3 py-2 rounded bg-red-600 text-white text-sm disabled:opacity-50"
              disabled={r.isExpired}
              onClick={() => cancel(r._id)}
              title={r.isExpired ? "This reservation already ended" : "Cancel reservation"}
            >
              Cancel
            </button>
          </div>
        ))
      )}
    </div>
  );
}