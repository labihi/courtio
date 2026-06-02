'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TopBar } from '@/components/layout/top-bar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userApi } from '@/lib/api';
import { VolleyballRole, ROLE_LABELS, ROLE_COLORS } from '@/types';
import { cn } from '@/lib/utils';

const COURT_ROLE_MAP: Record<VolleyballRole, { x: number; y: number }> = {
  OH: { x: 15, y: 30 },
  MB: { x: 50, y: 15 },
  OPP: { x: 85, y: 30 },
  SET: { x: 50, y: 60 },
  LIB: { x: 50, y: 80 },
  DS: { x: 50, y: 90 },
};

export default function RolesPage() {
  const t = useTranslations('roles');
  const [roles, setRoles] = useState<(VolleyballRole | '')[]>(['', '', '', '', '']);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    userApi.getMe().then((r) => {
      const userRoles = r.data.volleyballRoles ?? [];
      const padded = [...userRoles, '', '', '', '', ''].slice(0, 5) as (VolleyballRole | '')[];
      setRoles(padded);
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateMyRoles(roles.filter(Boolean) as VolleyballRole[]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const primaryRole = roles[0] as VolleyballRole | '';

  const SLOT_LABEL_KEYS = ['0', '1', '2', '3', '4'] as const;
  const SLOT_REQUIRED = [true, false, false, false, false];

  const ROLES_WITH_NONE = [
    { value: '', label: t('noneSelected') },
    ...Object.entries(ROLE_LABELS)
      .filter(([k]) => k !== 'DS')
      .map(([value, label]) => ({ value, label: `${label} (${value})` })),
  ];

  return (
    <div className="min-h-screen">
      <TopBar title={t('title')} showBack backHref="/profile" />

      <div className="px-4 pt-4 safe-pb space-y-4">
        <div>
          <h2 className="text-xl font-bold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>

        <div className="space-y-3">
          {SLOT_LABEL_KEYS.map((key, idx) => (
            <div
              key={idx}
              className={cn(
                'rounded-xl border p-4',
                idx === 0 ? 'border-primary/60 bg-primary/5' : 'border-border bg-card',
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'h-6 w-6 rounded text-xs font-bold flex items-center justify-center',
                      idx === 0 ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground',
                    )}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-bold uppercase tracking-wider',
                      idx === 0 ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {t(`slotLabels.${key}`)}
                  </span>
                </div>
                {SLOT_REQUIRED[idx] ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <span className="text-xs text-muted-foreground">{t('optional')}</span>
                )}
              </div>
              <Select
                value={roles[idx]}
                onValueChange={(v) => {
                  const next = [...roles];
                  next[idx] = v as VolleyballRole | '';
                  setRoles(next);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectRolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {ROLES_WITH_NONE.map(({ value, label }) => (
                    <SelectItem key={value || `none-${idx}`} value={value || `__none__${idx}`}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <Button className="w-full" size="lg" onClick={handleSave} disabled={saving || !roles[0]}>
          {saved ? t('savedBtn') : saving ? t('savingBtn') : t('updateBtn')}
        </Button>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-primary mb-3">
            {t('livePreviewTitle')}
          </h3>
          <div className="relative bg-secondary/30 rounded-lg aspect-[4/3] overflow-hidden">
            <div className="absolute inset-0 border-2 border-border/30 rounded-lg" />
            <div className="absolute top-1/2 inset-x-4 h-px bg-border/30" />

            {primaryRole && COURT_ROLE_MAP[primaryRole] && (
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{
                  left: `${COURT_ROLE_MAP[primaryRole].x}%`,
                  top: `${COURT_ROLE_MAP[primaryRole].y}%`,
                }}
              >
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/30',
                    ROLE_COLORS[primaryRole],
                  )}
                >
                  {primaryRole}
                </div>
              </div>
            )}
          </div>
          <div className="text-center mt-2">
            <p className="font-semibold text-sm">
              {primaryRole ? ROLE_LABELS[primaryRole] : t('noRoleSelected')}
            </p>
            <p className="text-xs text-muted-foreground">{t('primaryPosition')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
