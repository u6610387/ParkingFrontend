import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function MyReservations() {
  const [list, setList] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setErr(""); setMsg("");
    const data = await api("/api/reservations?mine=1");
    setList(data);
  }

  useEffect(() => { load().catch(e => setErr(e.message)); }, []);

  async function cancel(id) {
    setErr(""); setMsg("");
    try {
      await api(`/api/reservations/${id}`, { method: "DELETE" });
      setMsg("Cancelled!");
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">My Reservations</h1>
      {msg && <div className="text-sm text-green-700">{msg}</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      {list.map((r) => (
        <div key={r._id} className="bg-white border rounded p-4 flex items-center justify-between">
          <div>
            <div className="font-medium">{r.slotId?.slotCode} ({r.slotId?.zone})</div>
            <div className="text-sm text-slate-600">
              {new Date(r.startTime).toLocaleString()} → {new Date(r.endTime).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500">Status: {r.status}</div>
          </div>
          <button
            className="px-3 py-2 rounded bg-red-600 text-white text-sm disabled:opacity-50"
            disabled={r.status !== "active"}
            onClick={() => cancel(r._id)}
          >
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
}