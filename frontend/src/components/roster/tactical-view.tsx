'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Team, VolleyballRole, STANDARD_ROSTER } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TacticalViewProps {
  team: Team;
  onRecruitSlot?: (role: VolleyballRole) => void;
}

const COURT_POSITIONS: { role: VolleyballRole; label: string; gridArea: string }[] = [
  { role: 'OH', label: 'OH', gridArea: 'col-start-1 col-end-2 row-start-1' },
  { role: 'MB', label: 'MB', gridArea: 'col-start-2 col-end-3 row-start-1' },
  { role: 'OPP', label: 'OPP', gridArea: 'col-start-3 col-end-4 row-start-1' },
  { role: 'SET', label: 'SET', gridArea: 'col-start-2 col-end-3 row-start-2' },
  { role: 'MB', label: 'MB', gridArea: 'col-start-1 col-end-2 row-start-3' },
  { role: 'OH', label: 'OH', gridArea: 'col-start-2 col-end-3 row-start-3' },
  { role: 'LIB', label: 'LIB', gridArea: 'col-start-3 col-end-4 row-start-3' },
];

export function TacticalView({ team, onRecruitSlot }: TacticalViewProps) {
  const filledCount = team.members.filter((m) => m.status === 'ACTIVE').length;
  const totalSlots = 7;

  const roleToMembers: Partial<Record<VolleyballRole, typeof team.members>> = {};
  for (const member of team.members) {
    if (member.role) {
      roleToMembers[member.role] = [...(roleToMembers[member.role] ?? []), member];
    }
  }

  const usedByRole: Partial<Record<VolleyballRole, number>> = {};

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
          Tactical Roster View
        </h3>
        <Badge
          variant={filledCount >= totalSlots ? 'success' : 'default'}
          className="text-xs"
        >
          {filledCount}/{totalSlots} Filled
        </Badge>
      </div>

      <div className="relative bg-secondary/30 rounded-lg p-4 grid grid-cols-3 grid-rows-3 gap-3 aspect-[3/4]">
        <div className="absolute inset-0 rounded-lg border-2 border-border/30 pointer-events-none" />
        <div className="absolute top-1/2 inset-x-4 h-px bg-border/30 pointer-events-none" />

        {COURT_POSITIONS.map((pos, idx) => {
          const roleMembers = roleToMembers[pos.role] ?? [];
          const used = usedByRole[pos.role] ?? 0;
          const member = roleMembers[used];
          usedByRole[pos.role] = used + 1;

          return (
            <div key={idx} className={cn('flex flex-col items-center justify-center gap-1', pos.gridArea)}>
              {member ? (
                <>
                  <div className="relative">
                    <Avatar className="h-11 w-11 ring-2 ring-primary/60">
                      <AvatarImage src={member.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {member.user.firstName[0]}{member.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-[10px] font-medium truncate max-w-[60px] text-center leading-tight">
                    {member.user.firstName} ({pos.label})
                  </span>
                </>
              ) : (
                <button
                  onClick={() => onRecruitSlot?.(pos.role)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="h-11 w-11 rounded-full border-2 border-dashed border-border flex items-center justify-center group-hover:border-primary transition-colors">
                    <span className="text-muted-foreground group-hover:text-primary text-lg">+</span>
                  </div>
                  <span className="text-[10px] text-primary font-semibold">
                    Recruit {pos.label}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
