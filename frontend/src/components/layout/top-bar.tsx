'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, showBack, backHref, actions }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border safe-pt">
      <div className="flex items-center gap-3 px-4 h-14">
        {showBack && (
          <Link href={backHref || '/'} className="text-muted-foreground hover:text-foreground">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}

        <span className="flex-1 font-bold text-lg text-primary">
          {title || 'Courtio'}
        </span>

        <div className="flex items-center gap-2">
          {actions}
          {!showBack && (
            <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
              <Link href="/discover?search=true">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <UserButton />
        </div>
      </div>
    </header>
  );
}
