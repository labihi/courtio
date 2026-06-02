'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { TopBar } from '@/components/layout/top-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { tournamentApi } from '@/lib/api';
import { Tournament } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

const EMPTY_FORM = {
  name: '', place: '', price: '', dateTime: '', maxTeamSlots: '',
  format: '6v6', skillLevel: 'Open', description: '', imageUrl: '',
};

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () =>
    tournamentApi.getAll().then((r) => setTournaments(r.data)).catch(console.error);

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); };
  const openEdit = (t: Tournament) => {
    setEditing(t);
    setForm({
      name: t.name, place: t.place, price: String(t.price),
      dateTime: t.dateTime.slice(0, 16),
      maxTeamSlots: String(t.maxTeamSlots),
      format: t.format, skillLevel: t.skillLevel,
      description: t.description ?? '', imageUrl: t.imageUrl ?? '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      price: Number(form.price),
      maxTeamSlots: Number(form.maxTeamSlots),
    };
    if (editing) {
      await tournamentApi.update(editing._id, payload);
    } else {
      await tournamentApi.create(payload);
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tournament?')) return;
    await tournamentApi.delete(id);
    load();
  };

  const f = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  return (
    <div className="min-h-screen">
      <TopBar title="Tournaments" showBack backHref="/admin" />

      <div className="px-4 pt-4 space-y-3">
        <Button className="w-full gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Tournament
        </Button>

        {tournaments.map((t) => (
          <div key={t._id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.place} · {formatDate(t.dateTime)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatCurrency(t.price)} · {t.registeredTeams?.length ?? 0}/{t.maxTeamSlots} teams
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Badge variant={t.status === 'OPEN' ? 'success' : 'secondary'} className="text-[10px]">
                  {t.status}
                </Badge>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(t)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(t._id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Tournament' : 'New Tournament'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {([
              ['name', 'Name', 'text', 'Pacific Slam Championship'],
              ['place', 'Venue', 'text', 'Grand Arena, Seattle WA'],
              ['price', 'Price ($)', 'number', '120'],
              ['dateTime', 'Date & Time', 'datetime-local', ''],
              ['maxTeamSlots', 'Max Team Slots', 'number', '32'],
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
                placeholder="Tournament overview..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {editing ? 'Save Changes' : 'Create Tournament'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
