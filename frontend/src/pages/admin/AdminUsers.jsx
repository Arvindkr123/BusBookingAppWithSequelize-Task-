import { useEffect, useState } from "react";
import { api } from "../../api/client";
import Alert from "../../components/Alert";
import EmptyState from "../../components/EmptyState";
import LoadingScreen from "../../components/LoadingScreen";
import PageHeading from "../../components/admin/PageHeading";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    setError("");
    setLoading(true);
    try {
      setUsers(await api.users.list());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-7">
      <PageHeading
        description="People registered with your booking service."
        eyebrow="Accounts"
        title="Users"
      />
      {error && <Alert onRetry={loadUsers}>{error}</Alert>}
      {loading ? (
        <LoadingScreen label="Loading users…" />
      ) : !error && users.length === 0 ? (
        <EmptyState title="No users found">
          New accounts will appear here after signup.
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
          <div className="border-b border-stone-100 px-5 py-4 text-sm text-slate-500">
            {users.length} registered {users.length === 1 ? "user" : "users"}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-[#f8f8f4] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Name</th>
                  <th className="px-5 py-3.5 font-semibold">Email</th>
                  <th className="px-5 py-3.5 font-semibold">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((user) => (
                  <tr className="text-slate-600" key={user.id}>
                    <td className="px-5 py-4 font-semibold text-ink">{user.name}</td>
                    <td className="px-5 py-4">{user.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.role === "ADMIN"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-[#eff4eb] text-forest"
                        }`}
                      >
                        {user.role === "ADMIN" ? "Admin" : "User"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
