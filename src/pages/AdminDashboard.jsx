import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/admin/stats")
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="text-red-600">{err}</div>;
  if (!data) return <div>Loading...</div>;

  const dowName = (n) => ["", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][n] || n;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>

      <div className="bg-white border rounded p-4">
        <div className="font-medium mb-2">Summary</div>
        <div className="text-sm text-slate-700">
          Active Slots: {data.summary.totalActiveSlots} • Reserved Now: {data.summary.reservedNow} • Available Now: {data.summary.availableNow}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-white border rounded p-4">
          <div className="font-medium mb-2">Peak Booking Hours</div>
          <div className="text-sm space-y-1">
            {data.peakHours.map((x) => (
              <div key={x._id}>Hour {x._id}: {x.count}</div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded p-4">
          <div className="font-medium mb-2">Most Reserved Zones</div>
          <div className="text-sm space-y-1">
            {data.topZones.map((x) => (
              <div key={x._id}>{x._id}: {x.count}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border rounded p-4">
        <div className="font-medium mb-2">Bookings by Day of Week</div>
        <div className="text-sm space-y-1">
          {data.byDayOfWeek.map((x) => (
            <div key={x._id}>{dowName(x._id)}: {x.count}</div>
          ))}
        </div>
      </div>
    </div>
  );
}