import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function AdminSlots() {
  const [slots, setSlots] = useState([]);
  const [slotCode, setSlotCode] = useState("");
  const [zone, setZone] = useState("");
  const [type, setType] = useState("car");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const data = await api("/api/slots");
    setSlots(data);
  }

  useEffect(() => { load().catch(e => setErr(e.message)); }, []);

  async function create() {
    setErr(""); setMsg("");
    try {
      const created = await api("/api/slots", {
        method: "POST",
        body: JSON.stringify({ slotCode, zone, type, status: "active" }),
      });
      setMsg("Created!");
      setSlotCode(""); setZone(""); setType("car");
      setSlots((p) => [created, ...p]);
    } catch (e) {
      setErr(e.message);
    }
  }

  async function del(id) {
    setErr(""); setMsg("");
    try {
      await api(`/api/slots/${id}`, { method: "DELETE" });
      setSlots((p) => p.filter(x => x._id !== id));
      setMsg("Deleted!");
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Admin: Manage Slots</h1>
      {msg && <div className="text-sm text-green-700">{msg}</div>}
      {err && <div className="text-sm text-red-600">{err}</div>}

      <div className="bg-white border rounded p-4 grid md:grid-cols-4 gap-3">
        <input className="border rounded p-2" placeholder="slotCode e.g. A-01" value={slotCode} onChange={(e)=>setSlotCode(e.target.value)} />
        <input className="border rounded p-2" placeholder="zone e.g. A" value={zone} onChange={(e)=>setZone(e.target.value)} />
        <select className="border rounded p-2" value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="car">Car</option><option value="motorcycle">Motorcycle</option>
          <option value="ev">EV</option><option value="disabled">Disabled</option><option value="other">Other</option>
        </select>
        <button className="bg-slate-900 text-white rounded p-2" onClick={create}>Create</button>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {slots.map((s) => (
          <div key={s._id} className="bg-white border rounded p-4 flex justify-between">
            <div>
              <div className="font-medium">{s.slotCode}</div>
              <div className="text-sm text-slate-600">Zone: {s.zone} • Type: {s.type} • Status: {s.status}</div>
            </div>
            <button className="text-sm px-3 py-2 rounded bg-red-600 text-white" onClick={() => del(s._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}