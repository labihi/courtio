'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { notificationsApi } from '@/lib/api';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { cn } from '@/lib/utils';

interface AppNotification {
  _id: string;
  type: 'TOURNAMENT_CREATED' | 'TOURNAMENT_FILLING';
  title: string;
  body: string;
  data: { tournamentId?: string };
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const t = useTranslations('notifications');
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const { permission, requestPermission } = usePushNotifications();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getAll();
      setNotifications(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unreadCount > 0) {
      notificationsApi.markAllRead().then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }).catch(() => {});
    }
  };

  const typeIcon = (type: AppNotification['type']) =>
    type === 'TOURNAMENT_FILLING' ? '🔥' : '🏐';

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center h-9 w-9 rounded-full hover:bg-secondary transition-colors"
        aria-label={t('bellLabel')}
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 h-4 min-w-4 px-0.5 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-card shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-card">
            <span className="text-sm font-bold">{t('panelTitle')}</span>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">{t('allRead')}</span>
            )}
          </div>

          {/* Push permission prompt */}
          {permission === 'default' && (
            <button
              onClick={requestPermission}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-border bg-primary/5 hover:bg-primary/10 transition-colors text-left"
            >
              <Bell className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-primary">{t('enablePush')}</p>
                <p className="text-[11px] text-muted-foreground">{t('enablePushHint')}</p>
              </div>
            </button>
          )}

          {permission === 'denied' && (
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary/30">
              <BellOff className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-[11px] text-muted-foreground">{t('pushDenied')}</p>
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t('empty')}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <Link
                  key={n._id}
                  href={n.data.tournamentId ? `/tournaments/${n.data.tournamentId}` : '/discover'}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors',
                    !n.read && 'bg-primary/5',
                  )}
                >
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-base shrink-0 mt-0.5">
                    {typeIcon(n.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-xs font-semibold truncate', !n.read && 'text-foreground')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
