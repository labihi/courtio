'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Team, TeamMember, VolleyballRole, User } from '@/types';
import { cn } from '@/lib/utils';

export interface TournamentRegInfo {
  registrationId: string;
  tournamentName: string;
  tournamentDate: string;
  roster: User[];
  rosterIds: string[]; // pre-coerced to string to avoid ObjectId vs string mismatch
}

interface TacticalViewProps {
  team: Team;
  onRecruitSlot?: (role: VolleyballRole) => void;
  tournamentRegistrations?: TournamentRegInfo[];
  onRosterChange?: (registrationId: string, newRosterIds: string[]) => Promise<void>;
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

const ROLE_ORDER: VolleyballRole[] = ['OH', 'MB', 'OPP', 'SET', 'LIB'];

export function TacticalView({ team, onRecruitSlot, tournamentRegistrations, onRosterChange }: TacticalViewProps) {
  const t = useTranslations('tacticalView');
  const [popupRole, setPopupRole] = useState<VolleyballRole | null>(null);
  const [selectedRegId, setSelectedRegId] = useState<string | null>(null);
  const [benchRole, setBenchRole] = useState<VolleyballRole | 'any' | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);

  const selectedReg = tournamentRegistrations?.find((r) => r.registrationId === selectedRegId) ?? null;
  const rosterIds = new Set(selectedReg?.rosterIds ?? []);

  const filledCount = selectedReg
    ? selectedReg.roster.length
    : team.members.filter((m) => m.status === 'ACTIVE').length;
  const totalSlots = 7;

  // Full team role map (used in court mode)
  const roleToMembers: Partial<Record<VolleyballRole, typeof team.members>> = {};
  for (const member of team.members) {
    if (member.role) {
      roleToMembers[member.role] = [...(roleToMembers[member.role] ?? []), member];
    }
  }
  const roleOverflow: Partial<Record<VolleyballRole, number>> = {};
  for (const role of Object.keys(SLOTS_PER_ROLE) as VolleyballRole[]) {
    const count = roleToMembers[role]?.length ?? 0;
    roleOverflow[role] = Math.max(0, count - (SLOTS_PER_ROLE[role] ?? 1));
  }

  // Tournament roster role map (used in list mode)
  const tournamentRoleToMembers: Partial<Record<VolleyballRole, typeof team.members>> = {};
  if (selectedReg) {
    for (const member of team.members) {
      if (rosterIds.has(member.user._id) && member.role) {
        tournamentRoleToMembers[member.role] = [...(tournamentRoleToMembers[member.role] ?? []), member];
      }
    }
  }

  const activeRoleToMembers = selectedReg ? tournamentRoleToMembers : roleToMembers;

  // Bench helpers for the add modal
  const getBenchForRole = (role: VolleyballRole) =>
    team.members.filter((m) => m.role === role && !rosterIds.has(m.user._id));

  const getBenchAny = () =>
    team.members.filter((m) => !rosterIds.has(m.user._id));

  const benchMembers =
    benchRole === null
      ? []
      : benchRole === 'any'
      ? getBenchAny()
      : getBenchForRole(benchRole);

  const handleAddToRoster = async (member: TeamMember) => {
    if (!selectedReg) return;
    const newRosterIds = [...selectedReg.rosterIds, member.user._id];
    await onRosterChange?.(selectedReg.registrationId, newRosterIds);
    setBenchRole(null);
  };

  const handleRemoveFromRoster = async () => {
    if (!selectedReg || !removeTarget) return;
    const newRosterIds = selectedReg.rosterIds.filter((id) => id !== removeTarget.user._id);
    await onRosterChange?.(selectedReg.registrationId, newRosterIds);
    setRemoveTarget(null);
  };

  // Roster members with no role assigned on the team
  const unassignedRosterMembers = selectedReg
    ? team.members.filter((m) => rosterIds.has(m.user._id) && !m.role)
    : [];

  const usedByRole: Partial<Record<VolleyballRole, number>> = {};

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary">
            {t('title')}
          </h3>
          <Badge
            variant={filledCount >= totalSlots ? 'success' : 'default'}
            className="text-xs"
          >
            {selectedReg
              ? t('rosterCount', { count: filledCount })
              : t('filledBadge', { filled: filledCount, total: totalSlots })}
          </Badge>
        </div>

        {tournamentRegistrations && tournamentRegistrations.length > 0 && (
          <Select
            value={selectedRegId ?? 'team'}
            onValueChange={(v) => setSelectedRegId(v === 'team' ? null : v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="team">{t('teamRoster')}</SelectItem>
              {tournamentRegistrations.map((reg) => (
                <SelectItem key={reg.registrationId} value={reg.registrationId}>
                  {reg.tournamentName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedReg ? (
        /* ── Tournament mode: role-grouped list, no slot cap ── */
        <div className="space-y-2">
          {ROLE_ORDER.map((role) => {
            const members = tournamentRoleToMembers[role] ?? [];
            const isLib = role === 'LIB';
            return (
              <div
                key={role}
                className={cn(
                  'rounded-lg border p-3',
                  isLib
                    ? 'border-amber-400/40 bg-amber-400/5'
                    : 'border-border bg-secondary/20',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn('text-xs font-bold uppercase tracking-widest', isLib ? 'text-amber-500' : 'text-primary')}>
                    {role}
                  </span>
                  <button
                    onClick={() => setBenchRole(role)}
                    className={cn(
                      'flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors',
                      isLib
                        ? 'border-amber-400/40 text-amber-500 hover:bg-amber-400/10'
                        : 'border-primary/30 text-primary hover:bg-primary/10',
                    )}
                  >
                    + {t('addBtn')}
                  </button>
                </div>
                {members.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic">{t('noPlayersForRole')}</p>
                ) : (
                  <div className="space-y-1">
                    {members.map((member, i) => (
                      <div key={i} className="flex items-center gap-2 group">
                        <Avatar className={cn('h-7 w-7 ring-1 shrink-0', isLib ? 'ring-amber-400/60' : 'ring-primary/40')}>
                          <AvatarImage src={member.user.avatar} />
                          <AvatarFallback className="text-[9px]">
                            {member.user.firstName[0]}{member.user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs flex-1 truncate font-medium">
                          {member.user.firstName} {member.user.lastName}
                        </span>
                        <button
                          onClick={() => setRemoveTarget(member)}
                          className="h-5 w-5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition-all shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {unassignedRosterMembers.length > 0 && (
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {t('unassigned')}
                </span>
              </div>
              <div className="space-y-1">
                {unassignedRosterMembers.map((member, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={member.user.avatar} />
                      <AvatarFallback className="text-[9px]">
                        {member.user.firstName[0]}{member.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs flex-1 truncate font-medium">
                      {member.user.firstName} {member.user.lastName}
                    </span>
                    <button
                      onClick={() => setRemoveTarget(member)}
                      className="h-5 w-5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition-all shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-1 text-xs"
            onClick={() => setBenchRole('any')}
          >
            + {t('addAnyPlayer')}
          </Button>
        </div>
      ) : (
        /* ── Team mode: fixed court grid ── */
        <div className="relative bg-secondary/30 rounded-lg p-4 grid grid-cols-3 grid-rows-3 gap-3 aspect-[3/4]">
          <div className="absolute inset-0 rounded-lg border-2 border-border/30 pointer-events-none" />
          <div className="absolute top-1/3 inset-x-4 h-px bg-border/30 pointer-events-none" />
          <div className="absolute top-2/3 inset-x-4 border-t border-dashed border-amber-400/40 pointer-events-none" />

          {COURT_POSITIONS.map((pos, idx) => {
            const roleMembers = activeRoleToMembers[pos.role] ?? [];
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
                  {(activeRoleToMembers[popupRole] ?? []).map((m, i) => (
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
      )}

      {/* Add to tournament roster */}
      <Dialog open={benchRole !== null} onOpenChange={(open) => !open && setBenchRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {benchRole === 'any'
                ? t('addAnyPlayer')
                : t('addToRoster', { role: benchRole ?? '' })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1 py-2">
            {benchMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('noBenchPlayers')}
              </p>
            ) : (
              benchMembers.map((member, i) => (
                <button
                  key={i}
                  onClick={() => handleAddToRoster(member)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.user.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.user.firstName[0]}{member.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="text-sm font-medium block truncate">
                      {member.user.firstName} {member.user.lastName}
                    </span>
                    {benchRole === 'any' && member.role && (
                      <span className="text-xs text-muted-foreground">{member.role}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove from tournament roster */}
      <Dialog open={removeTarget !== null} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('removeFromRoster')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            {t('removeConfirm', { name: `${removeTarget?.user.firstName} ${removeTarget?.user.lastName}` })}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              {t('cancelBtn')}
            </Button>
            <Button variant="destructive" onClick={handleRemoveFromRoster}>
              {t('removeBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
