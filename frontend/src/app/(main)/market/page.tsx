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
import { Tournament, Team, MarketPlayer, VolleyballRole, ROLE_LABELS, ROLE_COLORS } from '@/types';
import { cn } from '@/lib/utils';

export default function MarketPage() {
  const t = useTranslations('market');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [players, setPlayers] = useState<MarketPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<MarketPlayer | null>(null);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedRole, setSelectedRole] = useState<VolleyballRole | ''>('');

  useEffect(() => {
    tournamentApi.getAll('OPEN').then((r) => setTournaments(r.data)).catch(console.error);
    teamApi.getMine().then((r) => setMyTeams(r.data)).catch(console.error);
    loadMarket();
  }, []);

  useEffect(() => {
    loadMarket(selectedTournament || undefined);
  }, [selectedTournament]);

  const loadMarket = (tournamentId?: string) => {
    setLoading(true);
    registrationApi
      .getMarket(tournamentId)
      .then((r) => setPlayers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const filtered = players.filter(
    (p) => filterRole === 'all' || p.volleyballRoles.includes(filterRole as VolleyballRole),
  );

  const handleInvite = async () => {
    if (!selectedTeam || !selectedPlayer || !selectedRole) return;
    await teamApi.addMember(selectedTeam, { userId: selectedPlayer._id, role: selectedRole });
    setInviteOpen(false);
    setSelectedRole('');
    loadMarket(selectedTournament || undefined);
  };

  const handleTournamentChange = (value: string) => {
    setSelectedTournament(value === 'all' ? '' : value);
  };

  return (
    <div className="min-h-screen">
      <TopBar title={t('title')} />

      <div className="px-4 pt-4 safe-pb space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{t('findPlayers')}</p>
          <p className="text-xs text-muted-foreground">{t('description')}</p>
        </div>

        <Select value={selectedTournament || 'all'} onValueChange={handleTournamentChange}>
          <SelectTrigger>
            <SelectValue placeholder={t('allTournaments')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTournaments')}</SelectItem>
            {tournaments.map((tournament) => (
              <SelectItem key={tournament._id} value={tournament._id}>{tournament.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

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

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t('noPlayers')}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((player) => (
              <div
                key={player._id}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card"
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={player.avatar} />
                  <AvatarFallback>
                    {player.firstName?.[0]}{player.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {player.firstName} {player.lastName}
                  </p>

                  <div className="flex flex-wrap gap-1 mt-1">
                    {player.volleyballRoles.slice(0, 3).map((r) => (
                      <span
                        key={r}
                        className={cn(
                          'text-[9px] font-bold text-white px-1 rounded',
                          ROLE_COLORS[r] ?? 'bg-gray-500',
                        )}
                      >
                        {r}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] h-4 px-1',
                        player.hasTeam ? 'border-blue-500 text-blue-500' : 'border-green-500 text-green-500',
                      )}
                    >
                      {player.hasTeam ? t('available') : t('freeAgent')}
                    </Badge>

                    {player.soloRegistration && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1 border-orange-500 text-orange-500">
                        {t('soloFor', { tournament: player.soloRegistration.tournament.name })}
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPlayer(player);
                    setSelectedRole('');
                    setInviteOpen(true);
                  }}
                >
                  {t('addToTeamBtn')}
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
              {t('addToTeamTitle', { name: selectedPlayer?.firstName ?? '' })}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
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
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as VolleyballRole)}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectRolePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(ROLE_LABELS) as [VolleyballRole, string][])
                  .map(([value, label]) => {
                    const preferred = selectedPlayer?.volleyballRoles.includes(value);
                    return (
                      <SelectItem key={value} value={value}>
                        {preferred && <span className="text-yellow-400 mr-1">★</span>}
                        {label} ({value})
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>{t('cancelBtn')}</Button>
            <Button onClick={handleInvite} disabled={!selectedTeam || !selectedRole}>{t('addToTeamConfirmBtn')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
