'use client';

import Link from 'next/link';
import { Trophy, Users, UserCog, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TopBar } from '@/components/layout/top-bar';

export default function AdminPage() {
  const t = useTranslations('admin');

  const sections = [
    {
      href: '/admin/tournaments',
      icon: Trophy,
      label: t('tournaments.label'),
      description: t('tournaments.description'),
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      href: '/admin/teams',
      icon: Users,
      label: t('teams.label'),
      description: t('teams.description'),
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      href: '/admin/users',
      icon: UserCog,
      label: t('users.label'),
      description: t('users.description'),
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="min-h-screen">
      <TopBar title={t('title')} />
      <div className="px-4 pt-4 safe-pb space-y-3">
        <p className="text-sm text-muted-foreground">{t('description')}</p>
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
