'use client';

import { useEffect, useState } from 'react';
import { Plus, Download, UserPlus, Crown } from 'lucide-react';
import { TopBar } from '@/components/layout/top-bar';
import { TacticalView } from '@/components/roster/tactical-view';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teamApi, userApi } from '@/lib/api';
import { Team, User, VolleyballRole, ROLE_LABELS } from '@/types';

const ROLES = Object.entries(ROLE_LABELS) as [VolleyballRole, string][];

export default function RosterPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferTargetName, setTransferTargetName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<VolleyballRole | ''>('');
  const [recruitRole, setRecruitRole] = useState<VolleyballRole | null>(null);

  useEffect(() => {
    Promise.all([
      teamApi.getMine().then((res) => { if (res.data.length > 0) setTeam(res.data[0]); }),
      userApi.getMe().then((res) => setCurrentUser(res.data)),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const memberIds = new Set(team?.members.map((m) => m.user._id) ?? []);
      userApi.search(searchQuery).then((r) =>
        setSearchResults(r.data.filter((u: User) => !memberIds.has(u._id)))
      );
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const isCaptain = !!team && !!currentUser && team.captain._id === currentUser._id;

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    const res = await teamApi.create({ name: teamName });
    setTeam(res.data);
    setCreateOpen(false);
    setTeamName('');
  };

  const handleAddMember = async () => {
    if (!team || !selectedUserId || !selectedRole) return;
    const res = await teamApi.addMember(team._id, { userId: selectedUserId, role: selectedRole });
    setTeam(res.data);
    setAddMemberOpen(false);
    setSelectedUserId('');
    setSelectedRole('');
    setSearchQuery('');
  };

  const handleRemoveMember = async (userId: string) => {
    if (!team) return;
    const res = await teamApi.removeMember(team._id, userId);
    setTeam(res.data);
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    if (!team) return;
    const res = await teamApi.updateMemberRole(team._id, userId, role === 'none' ? null : role);
    setTeam(res.data);
  };

  const handleTransferCaptain = async () => {
    if (!team || !transferTargetId) return;
    const res = await teamApi.transferCaptain(team._id, transferTargetId);
    setTeam(res.data);
    setCurrentUser((u) => u ? { ...u, captainOf: [] } : u);
    setTransferOpen(false);
    setTransferTargetId('');
  };

  const handleRecruitSlot = (role: VolleyballRole) => {
    setRecruitRole(role);
    setSelectedRole(role);
    setAddMemberOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar title="Roster" />
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar title={team?.name ?? 'Roster'} />

      <div className="px-4 pt-4 safe-pb space-y-4">
        {!team ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏐</div>
            <h2 className="text-xl font-bold mb-2">No Team Yet</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Create your team to start competing in tournaments.
            </p>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Team
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Active Season: Regional Open 2024</p>
              <Badge variant="outline" className="text-primary border-primary/50 text-xs">
                {team.members.length} player{team.members.length !== 1 ? 's' : ''}{team.members.length < 7 ? ` · need ${7 - team.members.length} more` : ''}
              </Badge>
            </div>

            <TacticalView team={team} onRecruitSlot={handleRecruitSlot} />

            {/* Team Directory */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-bold">Team Directory</h3>
                <Button size="sm" variant="outline" className="gap-1 text-xs h-8">
                  <Download className="h-3 w-3" /> Export Roster
                </Button>
              </div>

              <div className="divide-y divide-border">
                {team.members.map((member, idx) => {
                  const memberIsCaptain = member.user._id === team.captain._id;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-4">
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        #{member.jerseyNumber ?? idx + 1}
                      </div>
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={member.user.avatar} />
                        <AvatarFallback>
                          {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {memberIsCaptain && <Crown className="h-3 w-3 text-yellow-400" />}
                          {memberIsCaptain ? 'Captain' : 'Member'}
                        </p>
                      </div>

                      {/* Role — editable by captain */}
                      <div className="shrink-0">
                        {isCaptain ? (
                          <Select
                            value={member.role ?? 'none'}
                            onValueChange={(v) => handleUpdateRole(member.user._id, v)}
                          >
                            <SelectTrigger className="h-7 text-xs w-32 border-dashed">
                              <SelectValue placeholder="No role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <span className="text-muted-foreground">No role</span>
                              </SelectItem>
                              {ROLES.map(([v, l]) => (
                                <SelectItem key={v} value={v}>{l}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {member.role ? ROLE_LABELS[member.role] : '—'}
                          </span>
                        )}
                      </div>

                      <Badge variant="success" className="text-[10px] shrink-0">Active</Badge>

                      {/* Captain actions on non-captain members */}
                      {isCaptain && !memberIsCaptain && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            title="Make captain"
                            onClick={() => {
                              setTransferTargetId(member.user._id);
                              setTransferTargetName(`${member.user.firstName} ${member.user.lastName}`);
                              setTransferOpen(true);
                            }}
                            className="text-muted-foreground hover:text-yellow-400 transition-colors"
                          >
                            <Crown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member.user._id)}
                            className="text-muted-foreground hover:text-destructive text-xs ml-1"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isCaptain && (
                <div className="p-4">
                  <Button variant="outline" className="w-full gap-2" onClick={() => setAddMemberOpen(true)}>
                    <UserPlus className="h-4 w-4" /> Add Player
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Team Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Team</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Team Name</Label>
              <Input
                className="mt-1"
                placeholder="Spike Squad"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateTeam}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Player{recruitRole ? ` – ${ROLE_LABELS[recruitRole]}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Search Player</Label>
              <Input
                className="mt-1"
                placeholder="Name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
                  {searchResults.map((u) => (
                    <button
                      key={u._id}
                      className={`w-full flex items-center gap-3 p-3 hover:bg-secondary text-left ${selectedUserId === u._id ? 'bg-primary/10' : ''}`}
                      onClick={() => {
                        setSelectedUserId(u._id);
                        setSearchQuery(`${u.firstName} ${u.lastName}`);
                        setSearchResults([]);
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>{u.firstName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-muted-foreground">{u.volleyballRoles?.join(', ')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <Label>Role on Team</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as VolleyballRole)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.filter(([r]) => r !== 'DS').map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l} ({v})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddMemberOpen(false); setRecruitRole(null); }}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={!selectedUserId || !selectedRole}>
              Add Player
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Captaincy Confirmation Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Captaincy</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to make <span className="font-semibold text-foreground">{transferTargetName}</span> the new captain?
            You will become a regular member.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleTransferCaptain}>
              Transfer Captaincy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
