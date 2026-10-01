"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, UserX, ShieldAlert, CheckCircle2, Search, Zap, Crown, UserCheck } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  subscription: {
    id: string | null;
    status: string;
    planId: string;
    planName: string;
    planDisplayName: string;
    paystackCustomerCode: string | null;
    paystackSubscriptionCode: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
}

export default function AdminUsersControl() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "plus" | "free">("all");
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      } else {
        setError(data.error || "Failed to load users");
      }
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRevoke = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to revoke Plus subscription for ${userName}? They will be downgraded to the Free tier.`)) {
      return;
    }

    setRevokingId(userId);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_subscription", userId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Subscription for ${userName} has been revoked.`);
        fetchUsers();
      } else {
        setError(data.error || "Failed to revoke subscription");
      }
    } catch {
      setError("An unexpected error occurred while revoking subscription.");
    } finally {
      setRevokingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterPlan === "plus") {
      return u.subscription.planId === "plus" && u.subscription.status === "active";
    }
    if (filterPlan === "free") {
      return u.subscription.planId !== "plus" || u.subscription.status !== "active";
    }
    return true;
  });

  const plusUsersCount = users.filter(
    (u) => u.subscription.planId === "plus" && u.subscription.status === "active"
  ).length;

  return (
    <div className="rounded-2xl border border-border bg-glass p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-text">User & Subscription Management</h2>
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            View all registered users and manage active Plus subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Crown className="h-3.5 w-3.5" />
            {plusUsersCount} Plus Subscribers
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background-secondary px-3 py-1 text-xs font-semibold text-text-secondary">
            <UserCheck className="h-3.5 w-3.5" />
            {users.length} Total Users
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-error/20 bg-error/10 p-3 text-sm text-error">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background-secondary py-2 pl-9 pr-4 text-sm text-text placeholder-text-muted outline-none transition focus:border-primary/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterPlan("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filterPlan === "all"
                ? "bg-primary text-white"
                : "border border-border bg-background-secondary text-text-secondary hover:text-text"
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setFilterPlan("plus")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filterPlan === "plus"
                ? "bg-primary text-white"
                : "border border-border bg-background-secondary text-text-secondary hover:text-text"
            }`}
          >
            Plus Only ({plusUsersCount})
          </button>
          <button
            onClick={() => setFilterPlan("free")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filterPlan === "free"
                ? "bg-primary text-white"
                : "border border-border bg-background-secondary text-text-secondary hover:text-text"
            }`}
          >
            Free Tier ({users.length - plusUsersCount})
          </button>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="py-12 text-center text-sm text-text-secondary">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background-secondary p-8 text-center text-sm text-text-secondary">
          No users match your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-background-secondary">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-background/50 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Joined Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => {
                const isPlus =
                  user.subscription.planId === "plus" && user.subscription.status === "active";

                return (
                  <tr key={user.id} className="transition hover:bg-background/40">
                    <td className="px-4 py-3 font-medium text-text">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="h-8 w-8 rounded-full border border-border object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-text">{user.name}</p>
                          <p className="text-xs text-text-muted">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <span>{user.email}</span>
                        {user.emailVerified && (
                          <span title="Email Verified">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {isPlus ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                          <Zap className="h-3 w-3 fill-primary" />
                          Plus Plan
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium text-text-muted">
                          Free
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-text-muted">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {isPlus ? (
                        <button
                          onClick={() => handleRevoke(user.id, user.name)}
                          disabled={revokingId === user.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-error/30 bg-error/10 px-3 py-1.5 text-xs font-semibold text-error transition hover:bg-error hover:text-white disabled:opacity-50"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          {revokingId === user.id ? "Revoking..." : "Revoke Plus"}
                        </button>
                      ) : (
                        <span className="text-xs text-text-muted">No active sub</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
