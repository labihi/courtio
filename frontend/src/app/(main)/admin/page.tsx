'use client';

import Link from 'next/link';
import { Trophy, Users, UserCog, ChevronRight } from 'lucide-react';
import { TopBar } from '@/components/layout/top-bar';

const sections = [
  {
    href: '/admin/tournaments',
    icon: Trophy,
    label: 'Tournaments',
    description: 'Create and manage tournaments',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    href: '/admin/teams',
    icon: Users,
    label: 'Teams',
    description: 'View and manage all teams',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    href: '/admin/users',
    icon: UserCog,
    label: 'Users',
    description: 'Manage users and roles',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <TopBar title="Admin Panel" />
      <div className="px-4 pt-4 space-y-3">
        <p className="text-sm text-muted-foreground">Manage all aspects of the platform.</p>
        {sections.map(({ href, icon: Icon, label, description, color, bg }) => (
          <Link key={href} href={href} className="block">
            <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
