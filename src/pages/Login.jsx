import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email, password);
      nav("/");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded border">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      {err && <div className="mb-3 text-sm text-red-600">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded p-2" placeholder="Email"
          value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password"
          value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="w-full bg-slate-900 text-white rounded p-2">Login</button>
      </form>
      <div className="mt-3 text-sm">
        No account? <Link className="underline" to="/register">Register</Link>
      </div>
    </div>
  );
}