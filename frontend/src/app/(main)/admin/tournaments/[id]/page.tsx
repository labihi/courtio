'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Users, Trash2, Pencil } from 'lucide-react';
import { TopBar } from '@/components/layout/top-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { tournamentApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Tournament } from '@/types';
import { formatDateTime, formatCurrency } from '@/lib/utils';

const STATUS_OPTIONS = ['UPCOMING', 'OPEN', 'FULL', 'ONGOING', 'COMPLETED', 'CANCELLED'] as const;

const EMPTY_FORM = {
  name: '', place: '', price: '', dateTime: '', maxTeamSlots: '',
  format: '6v6', skillLevel: 'Open', description: '', imageUrl: '',
};

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'secondary' | 'destructive' | 'warning'> = {
  OPEN: 'success',
  ONGOING: 'success',
  UPCOMING: 'secondary',
  FULL: 'warning',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
};

export default function AdminTournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () =>
    tournamentApi.getById(id).then((r) => setTournament(r.data)).catch(console.error).finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]);

  const openEdit = () => {
    if (!tournament) return;
    setForm({
      name: tournament.name,
      place: tournament.place,
      price: String(tournament.price),
      dateTime: new Date(tournament.dateTime).toISOString().slice(0, 16),
      maxTeamSlots: String(tournament.maxTeamSlots),
      format: tournament.format,
      skillLevel: tournament.skillLevel,
      description: tournament.description ?? '',
      imageUrl: tournament.imageUrl ?? '',
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    const payload: Record<string, unknown> = {
      ...form,
      price: Number(form.price),
      maxTeamSlots: Number(form.maxTeamSlots),
    };
    if (!payload.imageUrl) delete payload.imageUrl;
    await tournamentApi.update(id, payload);
    setEditOpen(false);
    load();
  };

  const handleStatusChange = async (status: string) => {
    await tournamentApi.updateStatus(id, status);
    load();
  };

  const handleRemoveTeam = async (teamId: string) => {
    if (!confirm('Remove this team from the tournament?')) return;
    await tournamentApi.removeTeam(id, teamId);
    toast.success('Team removed');
    load();
  };

  const f = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar title="Tournament" showBack backHref="/admin/tournaments" />
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  const registeredTeams = (tournament.registeredTeams ?? []) as any[];
  const soloRegs = (tournament.soloRegistrations ?? []) as any[];

  return (
    <div className="min-h-screen">
      <TopBar title={tournament.name} showBack backHref="/admin/tournaments" />

      <div className="px-4 pt-4 safe-pb space-y-4">

        {/* Header card */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-lg truncate">{tournament.name}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{tournament.place} · {formatDateTime(tournament.dateTime)}</p>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={openEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Format', tournament.format],
              ['Skill', tournament.skillLevel],
              ['Price', formatCurrency(tournament.price)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-secondary p-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className="text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Select value={tournament.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Slots</p>
              <p className="text-sm font-bold">
                {registeredTeams.length}<span className="text-muted-foreground">/{tournament.maxTeamSlots}</span>
              </p>
            </div>
          </div>

          {tournament.description && (
            <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
              {tournament.description}
            </p>
          )}
        </div>

        {/* Registered teams */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Registered Teams
              <Badge variant="outline" className="text-[10px]">{registeredTeams.length}</Badge>
            </h2>
          </div>
          {registeredTeams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No teams registered yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {registeredTeams.map((team: any) => (
                <div key={team._id} className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Captain: {team.captain?.firstName} {team.captain?.lastName}
                      {' · '}
                      {team.members?.length ?? 0} players
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex -space-x-2">
                      {(team.members ?? []).slice(0, 4).map((m: any, i: number) => (
                        <Avatar key={i} className="h-6 w-6 ring-1 ring-background">
                          <AvatarImage src={m.user?.avatar} />
                          <AvatarFallback className="text-[8px]">{m.user?.firstName?.[0]}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveTeam(team._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Solo registrations */}
        {soloRegs.length > 0 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-bold text-sm">Want to Join ({soloRegs.length})</h2>
            </div>
            <div className="divide-y divide-border">
              {soloRegs.map((reg: any) => (
                <div key={reg._id} className="flex items-center gap-3 p-4">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={reg.player?.avatar} />
                    <AvatarFallback>{reg.player?.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {reg.player?.firstName} {reg.player?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reg.role} · {reg.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tournament</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {([
              ['name', 'Name', 'text', ''],
              ['place', 'Venue', 'text', ''],
              ['price', 'Price ($)', 'number', ''],
              ['dateTime', 'Date & Time', 'datetime-local', ''],
              ['maxTeamSlots', 'Max Team Slots', 'number', ''],
              ['imageUrl', 'Image URL', 'url', 'https://...'],
            ] as const).map(([key, label, type, placeholder]) => (
              <div key={key}>
                <Label className="text-xs">{label}</Label>
                <Input className="mt-1" type={type} placeholder={placeholder} {...f(key as keyof typeof form)} />
              </div>
            ))}
            <div>
              <Label className="text-xs">Format</Label>
              <Select value={form.format} onValueChange={(v) => setForm((p) => ({ ...p, format: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['6v6', '4v4', '2v2'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Skill Level</Label>
              <Select value={form.skillLevel} onValueChange={(v) => setForm((p) => ({ ...p, skillLevel: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['A', 'A/BB', 'BB', 'BB/B', 'B', 'Open', 'Elite'].map((v) => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Description</Label>
              <textarea
                className="mt-1 w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
