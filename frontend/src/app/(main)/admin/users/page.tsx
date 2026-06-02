'use client';

import { useEffect, useState } from 'react';
import { TopBar } from '@/components/layout/top-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userApi } from '@/lib/api';
import { User } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    userApi.getAll()
      .then((r) => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    await userApi.update(userId, { platformRole: role });
    load();
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user?')) return;
    await userApi.delete(userId);
    load();
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Users" showBack backHref="/admin" />

      <div className="px-4 pt-4 safe-pb space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />
          ))
        ) : (
          users.map((user) => (
            <div key={user._id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Select
                  value={user.platformRole}
                  onValueChange={(v) => handleRoleChange(user._id, v)}
                >
                  <SelectTrigger className="h-7 w-20 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleDelete(user._id)}
                >
                  ✕
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
