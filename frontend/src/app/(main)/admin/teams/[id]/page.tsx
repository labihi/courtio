'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserPlus, Trash2, Pencil, Crown } from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';
import { Team, TeamMember, VolleyballRole, ROLE_LABELS } from '@/types';

const ROLES = Object.entries(ROLE_LABELS) as [VolleyballRole, string][];

export default function AdminTeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslations('adminTeams');
  const td = useTranslations('adminTeams.detail');

  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSeason, setEditSeason] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedUserName, setSelectedUserName] = useState('');
  const [addRole, setAddRole] = useState<VolleyballRole | ''>('');
  const [jerseyNumber, setJerseyNumber] = useState('');

  const [roleEdit, setRoleEdit] = useState<Record<string, VolleyballRole>>({});

  const load = () =>
    teamApi.getById(id).then((r) => setTeam(r.data)).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    teamApi.getAll().then((r) => setAllTeams(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (search.length > 1) userApi.search(search).then((r) => setResults(r.data));
    else setResults([]);
  }, [search]);

  const openEdit = () => {
    if (!team) return;
    setEditName(team.name);
    setEditSeason(team.season ?? '');
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    await teamApi.update(id, { name: editName, season: editSeason || undefined });
    toast.success('Team updated');
    setEditOpen(false);
    load();
  };

  const handleAddMember = async () => {
    if (!selectedUser || !addRole) return;
    await teamApi.addMember(id, {
      userId: selectedUser,
      role: addRole,
      jerseyNumber: jerseyNumber ? Number(jerseyNumber) : undefined,
    });
    toast.success('Member added');
    setAddOpen(false);
    setSearch(''); setSelectedUser(''); setSelectedUserName(''); setAddRole(''); setJerseyNumber('');
    load();
  };

  const handleRoleChange = async (userId: string, role: VolleyballRole) => {
    setRoleEdit((p) => ({ ...p, [userId]: role }));
    await teamApi.updateMemberRole(id, userId, role);
    toast.success('Role updated');
    load();
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm(td('removeConfirm'))) return;
    await teamApi.removeMember(id, userId);
    toast.success('Member removed');
    load();
  };

  const handleTransferCaptain = async (member: TeamMember) => {
    const name = `${member.user.firstName} ${member.user.lastName}`;
    if (!confirm(td('transferCaptainConfirm', { name }))) return;
    await teamApi.transferCaptain(id, member.user._id);
    toast.success('Captaincy transferred');
    load();
  };

  const handleDeleteTeam = async () => {
    if (!confirm(t('deleteConfirm'))) return;
    await teamApi.delete(id);
    window.history.back();
  };

  if (loading) return (
    <div className="min-h-screen">
      <TopBar title="Team" showBack backHref="/admin/teams" />
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  if (!team) return null;

  const captainId = team.captain._id;

  return (
    <div className="min-h-screen">
      <TopBar title={team.name} showBack backHref="/admin/teams" />

      <div className="px-4 pt-4 safe-pb space-y-4">

        {allTeams.length > 0 && (
          <Select value={id} onValueChange={(v) => router.push(`/admin/teams/${v}`)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allTeams.map((t) => (
                <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Header card */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg truncate">{team.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {td('captainBadge')}: {team.captain.firstName} {team.captain.lastName}
              </p>
              {team.season && (
                <p className="text-xs text-muted-foreground">{td('seasonLabel')}: {team.season}</p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={openEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={handleDeleteTeam}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="font-bold text-sm flex items-center gap-2">
              {td('membersTitle')}
              <Badge variant="outline" className="text-[10px]">{team.members.length}</Badge>
            </h2>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => setAddOpen(true)}>
              <UserPlus className="h-3.5 w-3.5" /> {td('addMemberBtn')}
            </Button>
          </div>

          {team.members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{td('noMembers')}</p>
          ) : (
            <div className="divide-y divide-border">
              {team.members.map((m) => {
                const isCaptain = m.user._id === captainId;
                const currentRole = roleEdit[m.user._id] ?? m.role;
                return (
                  <div key={m.user._id} className="flex items-center gap-3 p-4">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={m.user.avatar} />
                      <AvatarFallback>{m.user.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold truncate">
                          {m.user.firstName} {m.user.lastName}
                        </p>
                        {isCaptain && (
                          <Crown className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{m.user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select
                        value={currentRole}
                        onValueChange={(v) => handleRoleChange(m.user._id, v as VolleyballRole)}
                      >
                        <SelectTrigger className="h-7 text-xs w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map(([v, l]) => (
                            <SelectItem key={v} value={v}>{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!isCaptain && (
                        <Button
                          size="icon" variant="ghost" className="h-7 w-7 text-yellow-500"
                          title={td('transferCaptainBtn')}
                          onClick={() => handleTransferCaptain(m)}
                        >
                          <Crown className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                        onClick={() => handleRemoveMember(m.user._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{td('editTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">{td('teamNameLabel')}</Label>
              <Input className="mt-1" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">{td('seasonLabel')}</Label>
              <Input className="mt-1" placeholder={td('seasonPlaceholder')} value={editSeason} onChange={(e) => setEditSeason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t('cancelBtn')}</Button>
            <Button onClick={handleEditSubmit} disabled={!editName.trim()}>{td('saveBtn')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add member dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addPlayerTitle', { teamName: team.name })}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">{t('searchUserLabel')}</Label>
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
                      onClick={() => { setSelectedUser(u._id); setSelectedUserName(`${u.firstName} ${u.lastName}`); setSearch(`${u.firstName} ${u.lastName}`); setResults([]); }}
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
              <Label className="text-xs">{t('roleLabel')}</Label>
              <Select value={addRole} onValueChange={(v) => setAddRole(v as VolleyballRole)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder={t('selectRolePlaceholder')} /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{td('jerseyLabel')}</Label>
              <Input
                className="mt-1" type="number" min={1} max={99}
                value={jerseyNumber} onChange={(e) => setJerseyNumber(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>{t('cancelBtn')}</Button>
            <Button onClick={handleAddMember} disabled={!selectedUser || !addRole}>{t('addBtn')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
