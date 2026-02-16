import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

export default function Slots() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [zone, setZone] = useState("");
  const [type, setType] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setErr(""); setMsg("");
    const qs = new URLSearchParams();
    if (zone) qs.set("zone", zone);
    if (type) qs.set("type", type);
    qs.set("status", "active");
    const data = await api(`/api/slots?${qs.toString()}`);
    setSlots(data);
  }

  useEffect(() => { load().catch(e => setErr(e.message)); }, [zone, type]);

  const zones = useMemo(() => {
    const s = new Set(slots.map(x => x.zone));
    return ["", ...Array.from(s)];
  }, [slots]);

  async function reserve(slotId) {
    setErr(""); setMsg("");
    try {
      if (!user) throw new Error("Please login first");
      await api("/api/reservations", {
        method: "POST",
        body: JSON.stringify({ slotId, startTime, endTime }),
      });
      setMsg("Reserved successfully!");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Available Parking Slots</h1>

      {msg && <div className="text-sm text-green-700">{msg}</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      <div className="bg-white border rounded p-4 grid md:grid-cols-4 gap-3">
        <div>
          <div className="text-xs text-slate-500 mb-1">Zone</div>
          <input className="w-full border rounded p-2" placeholder="e.g. A" value={zone} onChange={(e)=>setZone(e.target.value)} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Type</div>
          <select className="w-full border rounded p-2" value={type} onChange={(e)=>setType(e.target.value)}>
            <option value="">All</option>
            <option value="car">Car</option>
            <option value="motorcycle">Motorcycle</option>
            <option value="ev">EV</option>
            <option value="disabled">Disabled</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Start</div>
          <input className="w-full border rounded p-2" type="datetime-local" value={startTime} onChange={(e)=>setStartTime(e.target.value)} />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">End</div>
          <input className="w-full border rounded p-2" type="datetime-local" value={endTime} onChange={(e)=>setEndTime(e.target.value)} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {slots.map((s) => (
          <div key={s._id} className="bg-white border rounded p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{s.slotCode}</div>
              <div className="text-sm text-slate-600">Zone: {s.zone} • Type: {s.type}</div>
            </div>
            <button
              className="px-3 py-2 rounded bg-slate-900 text-white text-sm"
              onClick={() => reserve(s._id)}
            >
              Reserve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}