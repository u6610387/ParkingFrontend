import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function Empty({ text = "No data" }) {
  return (
    <div className="h-64 grid place-items-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function pick(obj, keys, fallback = "-") {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return fallback;
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const dowName = (n) =>
    ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][n] || n;

  const fetchStats = async () => {
    const res = await api("/api/admin/stats");
    setData(res);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await fetchStats();
        if (!cancelled) setErr("");
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const onRefresh = async () => {
    try {
      setLoading(true);
      setErr("");
      await fetchStats();
    } catch (e) {
      setErr(e?.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  const summary = data?.summary || {};

  const totalActiveSlots = pick(summary, ["totalActiveSlots", "activeSlots", "totalSlots"]);
  const reservedNow = pick(summary, ["reservedNow", "ongoingNow", "reserved_now"]);
  const availableNow = pick(summary, ["availableNow", "available_now"]);
  const upcoming = pick(summary, ["upcomingReservations", "upcoming", "upcomingCount"]);
  const expired = pick(summary, ["expiredReservations", "expired", "pastReservations", "past"]);
  const cancelledCount = pick(summary, ["cancelledReservations", "cancelled", "cancelledCount"]);
  const bookingsToday = pick(summary, ["reservedToday", "bookingsToday", "todayBookings"]);

  const peakHoursData = useMemo(() => {
    const arr = data?.peakHours || [];
    return arr
      .map((x) => ({ hour: String(x._id), count: x.count }))
      .sort((a, b) => Number(a.hour) - Number(b.hour));
  }, [data]);

  const topZonesData = useMemo(() => {
    const arr = data?.topZones || [];
    return arr
      .map((x) => ({ zone: String(x._id), count: x.count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  const byDayData = useMemo(() => {
    const arr = data?.byDayOfWeek || [];
    return arr
      .map((x) => ({
        day: dowName(x._id),
        dayIndex: x._id,
        count: x.count,
      }))
      .sort((a, b) => Number(a.dayIndex) - Number(b.dayIndex));
  }, [data]);

  if (err) return <div className="text-red-600">{err}</div>;
  if (loading) return <div>Loading...</div>;
  if (!data) return <div className="text-slate-600">No data</div>;

  const kpi = [
    {
      label: "Active Slots",
      value: totalActiveSlots,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Reserved Now",
      value: reservedNow,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Available Now",
      value: availableNow,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Upcoming",
      value: upcoming,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
    {
      label: "Expired",
      value: expired,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100",
    },
    {
      label: "Cancelled",
      value: cancelledCount,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
    {
      label: "Bookings Today",
      value: bookingsToday,
      color: "text-slate-700",
      bg: "bg-slate-100",
      border: "border-slate-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

        <button
          className="text-sm border rounded-md px-3 py-1.5 hover:bg-slate-50"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map((x) => (
          <div
            key={x.label}
            className={`border rounded-lg p-4 shadow-sm ${x.bg} ${x.border}`}
          >
            <div className="text-sm text-slate-600">{x.label}</div>
            <div className={`text-2xl font-semibold ${x.color}`}>
              {x.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white shadow-sm border rounded-lg p-4">
          <div className="font-medium mb-3 text-slate-700">
            Peak Booking Hours
          </div>

          {peakHoursData.length === 0 ? (
            <Empty />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white shadow-sm border rounded-lg p-4">
          <div className="font-medium mb-3 text-slate-700">
            Most Reserved Zones
          </div>

          {topZonesData.length === 0 ? (
            <Empty />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topZonesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm border rounded-lg p-4">
        <div className="font-medium mb-3 text-slate-700">
          Bookings by Day of Week
        </div>

        {byDayData.length === 0 ? (
          <Empty />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}