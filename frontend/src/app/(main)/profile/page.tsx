'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { TopBar } from '@/components/layout/top-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { userApi } from '@/lib/api';
import { User } from '@/types';
import { ChevronRight, Trophy, Users, Settings, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    userApi.getMe().then((r) => setProfile(r.data)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen">
      <TopBar title="Profile" />

      <div className="px-4 pt-4 space-y-4">
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <Avatar className="h-20 w-20 ring-2 ring-primary ring-offset-2 ring-offset-background">
              <AvatarImage src={clerkUser?.imageUrl} />
              <AvatarFallback className="text-2xl">
                {clerkUser?.firstName?.[0]}{clerkUser?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="mt-3 text-xl font-bold">
            {clerkUser?.firstName} {clerkUser?.lastName}
          </h1>
          {profile && (
            <p className="text-sm text-muted-foreground mt-1">
              {profile.volleyballRoles[0]
                ? `${profile.volleyballRoles[0]} • `
                : ''}
              {profile.captainOf.length > 0 ? 'Captain' : 'Player'}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <Badge variant="outline">Indoor</Badge>
            <Badge variant="outline">Elite Division</Badge>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          <Link
            href="/profile/roles"
            className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Role Preferences</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.volleyballRoles?.slice(0, 2).join(', ') || 'Not set'}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <Link
            href="/roster"
            className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">My Team</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.teams?.length ?? 0} team{profile?.teams?.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          {profile?.platformRole === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-medium text-sm">Admin Panel</p>
                  <p className="text-xs text-muted-foreground">Manage tournaments &amp; users</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
