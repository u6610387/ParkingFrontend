import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-white border-b">
      <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
        <div className="font-semibold">Parkingslot</div>

        <div className="flex gap-4 items-center">
          <NavLink className="text-sm" to="/">Slots</NavLink>
          {user && <NavLink className="text-sm" to="/my">My Reservations</NavLink>}
          {user?.role === "admin" && (
            <>
              <NavLink className="text-sm" to="/admin/slots">Admin Slots</NavLink>
              <NavLink className="text-sm" to="/admin/dashboard">Dashboard</NavLink>
            </>
          )}

          <div className="ml-2">
            {!user ? (
              <div className="flex gap-3">
                <NavLink className="text-sm" to="/login">Login</NavLink>
                <NavLink className="text-sm" to="/register">Register</NavLink>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-600">Hi, {user.name}</span>
                <button
                  className="text-sm px-3 py-1 rounded bg-slate-900 text-white"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}