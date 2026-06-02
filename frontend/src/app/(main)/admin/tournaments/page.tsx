'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('adminTournaments');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () =>
    tournamentApi.getAll().then((r) => setTournaments(r.data)).catch(console.error);

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setOpen(true); };
  const openEdit = (tournament: Tournament) => {
    setEditing(tournament);
    setForm({
      name: tournament.name, place: tournament.place, price: String(tournament.price),
      dateTime: tournament.dateTime.slice(0, 16),
      maxTeamSlots: String(tournament.maxTeamSlots),
      format: tournament.format, skillLevel: tournament.skillLevel,
      description: tournament.description ?? '', imageUrl: tournament.imageUrl ?? '',
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    const payload: Record<string, unknown> = {
      ...form,
      price: Number(form.price),
      maxTeamSlots: Number(form.maxTeamSlots),
    };
    if (!payload.imageUrl) delete payload.imageUrl;
    if (editing) {
      await tournamentApi.update(editing._id, payload);
    } else {
      await tournamentApi.create(payload);
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    await tournamentApi.delete(id);
    load();
  };

  const f = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  const formFields: [keyof typeof form, string, string, string][] = [
    ['name', t('nameLabel'), 'text', t('namePlaceholder')],
    ['place', t('venueLabel'), 'text', t('venuePlaceholder')],
    ['price', t('priceLabel'), 'number', t('pricePlaceholder')],
    ['dateTime', t('dateTimeLabel'), 'datetime-local', ''],
    ['maxTeamSlots', t('maxSlotsLabel'), 'number', t('maxSlotsPlaceholder')],
    ['imageUrl', t('imageUrlLabel'), 'url', t('imageUrlPlaceholder')],
  ];

  return (
    <div className="min-h-screen">
      <TopBar title={t('title')} showBack backHref="/admin" />

      <div className="px-4 pt-4 safe-pb space-y-3">
        <Button className="w-full gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> {t('newTournamentBtn')}
        </Button>

        {tournaments.map((tournament) => (
          <div key={tournament._id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/admin/tournaments/${tournament._id}`} className="flex-1 min-w-0 min-w-0">
                <h3 className="font-semibold truncate hover:text-primary transition-colors">{tournament.name}</h3>
                <p className="text-xs text-muted-foreground">{tournament.place} · {formatDate(tournament.dateTime)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatCurrency(tournament.price)} · {t('teamsCount', { registered: tournament.registeredTeams?.length ?? 0, max: tournament.maxTeamSlots })}
                </p>
              </Link>
              <div className="flex gap-2 shrink-0">
                <Badge variant={tournament.status === 'OPEN' ? 'success' : 'secondary'} className="text-[10px]">
                  {tournament.status}
                </Badge>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(tournament)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(tournament._id)}>
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
            <DialogTitle>{editing ? t('editTitle') : t('newTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {formFields.map(([key, label, type, placeholder]) => (
              <div key={key}>
                <Label className="text-xs">{label}</Label>
                <Input className="mt-1" type={type} placeholder={placeholder} {...f(key)} />
              </div>
            ))}

            <div>
              <Label className="text-xs">{t('formatLabel')}</Label>
              <Select value={form.format} onValueChange={(v) => setForm((p) => ({ ...p, format: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['6v6', '4v4', '2v2'].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">{t('skillLevelLabel')}</Label>
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
              <Label className="text-xs">{t('descriptionLabel')}</Label>
              <textarea
                className="mt-1 w-full rounded-lg border border-input bg-secondary px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={t('descriptionPlaceholder')}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className='gap-3 pt-3'>
            <Button variant="outline" onClick={() => setOpen(false)}>{t('cancelBtn')}</Button>
            <Button onClick={handleSubmit}>
              {editing ? t('saveChangesBtn') : t('createBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
