'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TopBar } from '@/components/layout/top-bar';
import { TournamentCard } from '@/components/tournaments/tournament-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { tournamentApi } from '@/lib/api';
import { Tournament } from '@/types';
import Link from 'next/link';

type SortKey = 'dateAsc' | 'dateDesc' | 'priceAsc' | 'priceDesc' | 'nameAsc';

const STATUSES = ['UPCOMING', 'OPEN', 'FULL', 'ONGOING', 'COMPLETED', 'CANCELLED'] as const;
const FORMATS = ['6v6', '4v4', '2v2'] as const;
const SKILL_LEVELS = ['A', 'A/BB', 'BB', 'BB/B', 'B', 'Open', 'Elite'] as const;

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export default function DiscoverPage() {
  const t = useTranslations('discover');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('dateAsc');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [formatFilters, setFormatFilters] = useState<string[]>([]);
  const [skillFilters, setSkillFilters] = useState<string[]>([]);

  useEffect(() => {
    tournamentApi
      .getAll()
      .then((res) => setTournaments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeFilterCount = statusFilters.length + formatFilters.length + skillFilters.length;

  const clearFilters = () => {
    setStatusFilters([]);
    setFormatFilters([]);
    setSkillFilters([]);
  };

  const filtered = tournaments
    .filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.place.placeName.toLowerCase().includes(search.toLowerCase()) ||
      t.place.placeAddress.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((t) => statusFilters.length === 0 || statusFilters.includes(t.status))
    .filter((t) => formatFilters.length === 0 || formatFilters.includes(t.format))
    .filter((t) => skillFilters.length === 0 || skillFilters.includes(t.skillLevel))
    .sort((a, b) => {
      switch (sortBy) {
        case 'dateAsc':  return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
        case 'dateDesc': return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
        case 'priceAsc': return a.price - b.price;
        case 'priceDesc': return b.price - a.price;
        case 'nameAsc':  return a.name.localeCompare(b.name);
        default:         return 0;
      }
    });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen">
      <TopBar />

      <div className="px-4 pt-4 pb-2">
        <Badge variant="outline" className="text-primary border-primary/50 text-xs mb-3">
          {t('seasonBadge')}
        </Badge>
        <h1 className="text-2xl font-bold leading-tight">
          {t('heroTitle')}<br />
          {t('heroSubtitle')} <span className="text-primary">{t('heroHighlight')}</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          {t('heroDescription')}
        </p>
        <div className="flex gap-3 mt-4">
          <Button className="flex-1" asChild>
            <Link href="/discover">{t('findTournaments')}</Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/roster?create=true">{t('registerTeam')}</Link>
          </Button>
        </div>
      </div>

      <div className="px-4 mt-6 safe-pb">
        <Input
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        <h2 className="font-bold text-lg mb-2">{t('upcomingTitle')}</h2>
        <div className="flex gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal className="h-3 w-3" />
            {t('filtersBtn')}
            {activeFilterCount > 0 && (
              <Badge className="h-4 px-1 text-[10px] leading-none">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
            <SelectTrigger className="h-8 text-xs w-auto gap-1 pr-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateAsc">{t('sortDateAsc')}</SelectItem>
              <SelectItem value="dateDesc">{t('sortDateDesc')}</SelectItem>
              <SelectItem value="priceAsc">{t('sortPriceAsc')}</SelectItem>
              <SelectItem value="priceDesc">{t('sortPriceDesc')}</SelectItem>
              <SelectItem value="nameAsc">{t('sortNameAsc')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t('noTournaments')}
          </div>
        ) : (
          <div className="space-y-4">
            {featured && <TournamentCard tournament={featured} variant="featured" />}
            {rest.map((tournament) => (
              <TournamentCard key={tournament._id} tournament={tournament} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('filterTitle')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {t('filterStatus')}
              </p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilters((prev) => toggle(prev, s))}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      statusFilters.includes(s)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {t('filterFormat')}
              </p>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormatFilters((prev) => toggle(prev, f))}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      formatFilters.includes(f)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {t('filterSkill')}
              </p>
              <div className="flex flex-wrap gap-2">
                {SKILL_LEVELS.map((sk) => (
                  <button
                    key={sk}
                    onClick={() => setSkillFilters((prev) => toggle(prev, sk))}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      skillFilters.includes(sk)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {sk}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={clearFilters}>{t('filterClearAll')}</Button>
            <Button onClick={() => setFilterOpen(false)}>{t('filterApply')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
