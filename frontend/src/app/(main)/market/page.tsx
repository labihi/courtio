'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { TopBar } from '@/components/layout/top-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { tournamentApi, registrationApi, teamApi } from '@/lib/api';
import { Tournament, Registration, Team, VolleyballRole, ROLE_LABELS, ROLE_COLORS } from '@/types';
import { cn } from '@/lib/utils';

export default function MarketPage() {
  const t = useTranslations('market');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [players, setPlayers] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Registration | null>(null);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {
    tournamentApi.getAll('OPEN').then((r) => setTournaments(r.data)).catch(console.error);
    teamApi.getMine().then((r) => setMyTeams(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedTournament) return;
    setLoading(true);
    registrationApi
      .getWantToJoin(selectedTournament)
      .then((r) => setPlayers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedTournament]);

  const filtered = players.filter(
    (p) => filterRole === 'all' || p.role === filterRole,
  );

  const handleInvite = async () => {
    if (!selectedTeam || !selectedPlayer) return;
    await teamApi.addMember(selectedTeam, {
      userId: selectedPlayer.player!._id,
      role: selectedPlayer.role,
    });
    setInviteOpen(false);
    setPlayers((prev) => prev.filter((p) => p._id !== selectedPlayer._id));
  };

  return (
    <div className="min-h-screen">
      <TopBar title={t('title')} />

      <div className="px-4 pt-4 safe-pb space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{t('findSoloPlayers')}</p>
          <p className="text-xs text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <Select value={selectedTournament} onValueChange={setSelectedTournament}>
          <SelectTrigger>
            <SelectValue placeholder={t('selectTournamentPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {tournaments.map((tournament) => (
              <SelectItem key={tournament._id} value={tournament._id}>{tournament.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTournament && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(['all', 'OH', 'MB', 'OPP', 'SET', 'LIB'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  filterRole === r
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-muted-foreground',
                )}
              >
                {r === 'all' ? t('allRoles') : ROLE_LABELS[r as VolleyballRole]}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !selectedTournament ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t('noTournamentSelected')}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t('noPlayers')}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((reg) => (
              <div
                key={reg._id}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={reg.player?.avatar} />
                    <AvatarFallback>
                      {reg.player?.firstName?.[0]}{reg.player?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      'absolute -bottom-1 -right-1 text-[9px] font-bold text-white px-1 rounded',
                      ROLE_COLORS[reg.role] ?? 'bg-gray-500',
                    )}
                  >
                    {reg.role}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {reg.player?.firstName} {reg.player?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_LABELS[reg.role]}
                  </p>
                  {reg.player?.volleyballRoles && reg.player.volleyballRoles.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {reg.player.volleyballRoles.slice(0, 3).map((r) => (
                        <Badge key={r} variant="outline" className="text-[10px] h-4 px-1">
                          {r}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPlayer(reg);
                    setInviteOpen(true);
                  }}
                >
                  {t('inviteBtn')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('inviteTitle', { name: selectedPlayer?.player?.firstName ?? '' })}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>{t('cancelBtn')}</Button>
            <Button onClick={handleInvite} disabled={!selectedTeam}>{t('inviteConfirmBtn')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
