'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from 'next-intl';
import { teamApi, registrationApi } from '@/lib/api';
import { Tournament, Team, VolleyballRole, ROLE_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface RegisterDialogProps {
  tournament: Tournament;
  type: 'team' | 'solo';
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const FORMAT_MIN_ROSTER: Record<string, number> = {
  '6v6': 6,
  '4v4': 4,
  '2v2': 2,
};

const ROLES = Object.entries(ROLE_LABELS) as [VolleyballRole, string][];

export function RegisterDialog({ tournament, type, open, onOpenChange }: RegisterDialogProps) {
  const t = useTranslations('registerDialog');
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedRole, setSelectedRole] = useState<VolleyballRole | ''>('');
  const [selectedRoster, setSelectedRoster] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const minRoster = FORMAT_MIN_ROSTER[tournament.format] ?? 6;

  useEffect(() => {
    if (type === 'team') {
      teamApi.getMine().then((r) => setMyTeams(r.data)).catch(console.error);
    }
  }, [type]);

  const currentTeam = useMemo(
    () => myTeams.find((t) => t._id === selectedTeam) ?? null,
    [myTeams, selectedTeam],
  );

  const handleTeamChange = (teamId: string) => {
    setSelectedTeam(teamId);
    setSelectedRoster([]);
  };

  const toggleRoster = (userId: string) => {
    setSelectedRoster((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (type === 'team') {
        await registrationApi.registerAsTeam({
          tournamentId: tournament._id,
          teamId: selectedTeam,
          roster: selectedRoster,
          type: 'TEAM',
        });
      } else {
        if (!selectedRole) return;
        await registrationApi.registerAsSolo({
          tournamentId: tournament._id,
          role: selectedRole,
          type: 'SOLO',
          status: 'WANT_TO_JOIN',
        });
      }
      setDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = type === 'solo'
    ? !!selectedRole
    : !!selectedTeam && selectedRoster.length >= minRoster;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === 'team' ? t('registerAsTeamTitle') : t('joinSoloTitle')}
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🏐</div>
            <p className="font-semibold">
              {type === 'solo' ? t('successSoloTitle') : t('successTeamTitle')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {type === 'solo'
                ? t('successSoloDescription')
                : t('successTeamDescription', { tournamentName: tournament.name })}
            </p>
            <Button className="mt-4 w-full" onClick={() => onOpenChange(false)}>{t('doneBtn')}</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                  {t('tournamentLabel')}
                </Label>
                <p className="font-semibold">{tournament.name}</p>
              </div>

              {type === 'team' && (
                <>
                  <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                      {t('selectTeamLabel')}
                    </Label>
                    <Select value={selectedTeam} onValueChange={handleTeamChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectTeamPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {myTeams.map((team) => (
                          <SelectItem key={team._id} value={team._id}>{team.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentTeam && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          {t('selectRosterLabel')}
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {t('rosterMembersSelected', { count: selectedRoster.length, min: minRoster })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        {t('rosterMinHint', { min: minRoster, format: tournament.format })}
                      </p>
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {currentTeam.members.map((member) => {
                          const userId = member.user._id;
                          const checked = selectedRoster.includes(userId);
                          return (
                            <button
                              key={userId}
                              type="button"
                              onClick={() => toggleRoster(userId)}
                              className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-border hover:bg-accent transition-colors text-left"
                            >
                              <div className={cn(
                                'h-4 w-4 shrink-0 rounded border flex items-center justify-center',
                                checked ? 'bg-primary border-primary' : 'border-border',
                              )}>
                                {checked && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage src={member.user.avatar} />
                                <AvatarFallback className="text-xs">
                                  {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-none">
                                  {member.user.firstName} {member.user.lastName}
                                </p>
                              </div>
                              {member.role && (
                                <Badge variant="outline" className="text-[10px] shrink-0">
                                  {member.role}
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {type === 'solo' && (
                <div>
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                    {t('yourRoleLabel')}
                  </Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as VolleyballRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectRolePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label} ({value})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter className="gap-3 pt-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>{t('cancelBtn')}</Button>
              <Button onClick={handleSubmit} disabled={loading || !canSubmit}>
                {loading ? t('registeringBtn') : t('confirmBtn')}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
