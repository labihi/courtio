'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Team, VolleyballRole } from '@/types';
import { cn } from '@/lib/utils';

interface TacticalViewProps {
  team: Team;
  onRecruitSlot?: (role: VolleyballRole) => void;
}

const COURT_POSITIONS: { role: VolleyballRole; label: string; gridArea: string; special?: boolean }[] = [
  { role: 'OH',  label: 'OH',  gridArea: 'col-start-1 col-end-2 row-start-1' },
  { role: 'MB',  label: 'MB',  gridArea: 'col-start-2 col-end-3 row-start-1' },
  { role: 'OPP', label: 'OPP', gridArea: 'col-start-3 col-end-4 row-start-1' },
  { role: 'MB',  label: 'MB',  gridArea: 'col-start-1 col-end-2 row-start-2' },
  { role: 'OH',  label: 'OH',  gridArea: 'col-start-2 col-end-3 row-start-2' },
  { role: 'SET', label: 'SET', gridArea: 'col-start-3 col-end-4 row-start-2' },
  { role: 'LIB', label: 'LIB', gridArea: 'col-start-3 col-end-4 row-start-3', special: true },
];

const SLOTS_PER_ROLE = COURT_POSITIONS.reduce<Partial<Record<VolleyballRole, number>>>(
  (acc, pos) => ({ ...acc, [pos.role]: (acc[pos.role] ?? 0) + 1 }),
  {},
);

export function TacticalView({ team, onRecruitSlot }: TacticalViewProps) {
  const t = useTranslations('tacticalView');
  const [popupRole, setPopupRole] = useState<VolleyballRole | null>(null);

  const filledCount = team.members.filter((m) => m.status === 'ACTIVE').length;
  const totalSlots = 7;

  const roleToMembers: Partial<Record<VolleyballRole, typeof team.members>> = {};
  for (const member of team.members) {
    if (member.role) {
      roleToMembers[member.role] = [...(roleToMembers[member.role] ?? []), member];
    }
  }

  const roleOverflow: Partial<Record<VolleyballRole, number>> = {};
  for (const role of Object.keys(SLOTS_PER_ROLE) as VolleyballRole[]) {
    const count = roleToMembers[role]?.length ?? 0;
    const slots = SLOTS_PER_ROLE[role] ?? 1;
    roleOverflow[role] = Math.max(0, count - slots);
  }

  const usedByRole: Partial<Record<VolleyballRole, number>> = {};

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
          {t('title')}
        </h3>
        <Badge
          variant={filledCount >= totalSlots ? 'success' : 'default'}
          className="text-xs"
        >
          {t('filledBadge', { filled: filledCount, total: totalSlots })}
        </Badge>
      </div>

      <div className="relative bg-secondary/30 rounded-lg p-4 grid grid-cols-3 grid-rows-3 gap-3 aspect-[3/4]">
        <div className="absolute inset-0 rounded-lg border-2 border-border/30 pointer-events-none" />
        {/* half-court line between front and back row */}
        <div className="absolute top-1/3 inset-x-4 h-px bg-border/30 pointer-events-none" />
        {/* libero separator */}
        <div className="absolute top-2/3 inset-x-4 border-t border-dashed border-amber-400/40 pointer-events-none" />

        {COURT_POSITIONS.map((pos, idx) => {
          const roleMembers = roleToMembers[pos.role] ?? [];
          const used = usedByRole[pos.role] ?? 0;
          const member = roleMembers[used];
          const overflow = roleOverflow[pos.role] ?? 0;
          usedByRole[pos.role] = used + 1;

          const special = pos.special ?? false;
          const ringClass    = special ? 'ring-amber-400/60'   : 'ring-primary/60';
          const circleBg     = special ? 'bg-amber-400/10'     : 'bg-primary/10';
          const circleBorder = special ? 'border-amber-400/30' : 'border-primary/30';
          const textAccent   = special ? 'text-amber-500'      : 'text-primary';
          const badgeBg      = special ? 'bg-amber-500 hover:bg-amber-500/80' : 'bg-primary hover:bg-primary/80';

          return (
            <div
              key={idx}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5',
                pos.gridArea,
                special && 'rounded-lg border border-amber-400/40 bg-amber-400/5 mt-2',
              )}
            >
              {overflow > 0 ? (
                <div className="relative flex flex-col items-center gap-0.5">
                  <div className={cn('h-11 w-11 rounded-full border-2 flex items-center justify-center', circleBg, circleBorder)}>
                    <span className={cn('text-xs font-bold', textAccent)}>{pos.label}</span>
                  </div>
                  <button
                    onClick={() => setPopupRole(pos.role)}
                    className={cn('absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-background transition-colors', badgeBg)}
                  >
                    +{overflow}
                  </button>
                  <span className={cn('text-[10px] font-semibold', textAccent)}>{pos.label}</span>
                </div>
              ) : member ? (
                <div className="flex flex-col items-center gap-0.5">
                  <Avatar className={cn('h-11 w-11 ring-2', ringClass)}>
                    <AvatarImage src={member.user.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.user.firstName[0]}{member.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] font-medium truncate max-w-[60px] text-center leading-tight">
                    {member.user.firstName} {member.user.lastName}
                  </span>
                  <span className={cn('text-[10px] text-center leading-tight', special ? 'text-amber-500 font-semibold' : 'text-muted-foreground')}>
                    ({pos.label})
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => onRecruitSlot?.(pos.role)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={cn('h-11 w-11 rounded-full border-2 border-dashed flex items-center justify-center transition-colors', special ? 'border-amber-400/40 group-hover:border-amber-400' : 'border-border group-hover:border-primary')}>
                    <span className={cn('text-lg', special ? 'text-amber-400/60 group-hover:text-amber-400' : 'text-muted-foreground group-hover:text-primary')}>+</span>
                  </div>
                  <span className={cn('text-[10px] font-semibold', textAccent)}>{pos.label}</span>
                </button>
              )}
            </div>
          );
        })}

        {popupRole && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm"
            onClick={() => setPopupRole(null)}
          >
            <div
              className="bg-card border border-border rounded-xl p-4 w-48 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  {popupRole}
                </span>
                <button
                  onClick={() => setPopupRole(null)}
                  className="text-muted-foreground hover:text-foreground text-xs leading-none"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {(roleToMembers[popupRole] ?? []).map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={m.user.avatar} />
                      <AvatarFallback className="text-[9px]">
                        {m.user.firstName[0]}{m.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs truncate">{m.user.firstName} {m.user.lastName}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
