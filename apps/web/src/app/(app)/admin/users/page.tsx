"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { api } from "@/lib/api";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin.users"],
    queryFn: async () => {
      const { data } = await api.get<{ items: UserRow[] }>("/users");
      return data;
    },
  });

  return (
    <div className="space-y-5">
      <h1 className="cc-h1">Users</h1>
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-2">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-fg2 text-left bg-surface2">
                <tr>
                  <th className="py-3 px-5 font-medium">Email</th>
                  <th className="font-medium">Name</th>
                  <th className="font-medium">Role</th>
                  <th className="font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((u) => (
                  <tr key={u.id} className="border-t border-border hover:bg-surface2/40">
                    <td className="py-3 px-5">{u.email}</td>
                    <td>{u.name ?? "—"}</td>
                    <td>
                      <span className="cc-chip">{u.role}</span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
