'use client';

import { useEffect, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TopBar } from '@/components/layout/top-bar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teamApi, userApi } from '@/lib/api';
import { Team, VolleyballRole, ROLE_LABELS } from '@/types';

export default function AdminTeamsPage() {
  const t = useTranslations('adminTeams');
  const [teams, setTeams] = useState<Team[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [targetTeam, setTargetTeam] = useState<Team | null>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [role, setRole] = useState<VolleyballRole | ''>('');

  const load = () => teamApi.getAll().then((r) => setTeams(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (search.length > 1) userApi.search(search).then((r) => setResults(r.data));
    else setResults([]);
  }, [search]);

  const handleAddMember = async () => {
    if (!targetTeam || !selectedUser || !role) return;
    await teamApi.addMember(targetTeam._id, { userId: selectedUser, role });
    setAddOpen(false);
    load();
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    await teamApi.delete(id);
    load();
  };

  return (
    <div className="min-h-screen">
      <TopBar title={t('title')} showBack backHref="/admin" />

      <div className="px-4 pt-4 safe-pb space-y-3">
        {teams.map((team) => (
          <div key={team._id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">{team.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {t('captainLabel')} {team.captain.firstName} {team.captain.lastName}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon" variant="ghost" className="h-8 w-8"
                  onClick={() => { setTargetTeam(team); setAddOpen(true); }}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon" variant="ghost" className="h-8 w-8 text-destructive"
                  onClick={() => handleDeleteTeam(team._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {team.members.map((m, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-secondary rounded-lg px-2 py-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={m.user.avatar} />
                    <AvatarFallback className="text-[8px]">{m.user.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{m.user.firstName}</span>
                  {m.role && <Badge variant="outline" className="text-[9px] h-4 px-1">{m.role}</Badge>}
                </div>
              ))}
              <Badge variant="secondary" className="text-xs">
                {team.members.length}/7
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addPlayerTitle', { teamName: targetTeam?.name ?? '' })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>{t('searchUserLabel')}</Label>
              <Input
                className="mt-1" placeholder={t('searchUserPlaceholder')}
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
              {results.length > 0 && (
                <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
                  {results.map((u) => (
                    <button
                      key={u._id}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-secondary text-left ${selectedUser === u._id ? 'bg-primary/10' : ''}`}
                      onClick={() => { setSelectedUser(u._id); setSearch(`${u.firstName} ${u.lastName}`); setResults([]); }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>{u.firstName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{u.firstName} {u.lastName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>{t('roleLabel')}</Label>
              <Select value={role} onValueChange={(v) => setRole(v as VolleyballRole)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t('selectRolePlaceholder')} /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(ROLE_LABELS) as [VolleyballRole, string][])
                    .filter(([r]) => r !== 'DS')
                    .map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>{t('cancelBtn')}</Button>
            <Button onClick={handleAddMember} disabled={!selectedUser || !role}>{t('addBtn')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
