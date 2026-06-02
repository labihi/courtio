'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { TopBar } from '@/components/layout/top-bar';
import { TournamentCard } from '@/components/tournaments/tournament-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { tournamentApi } from '@/lib/api';
import { Tournament } from '@/types';
import Link from 'next/link';

export default function DiscoverPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    tournamentApi
      .getAll()
      .then((res) => setTournaments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = tournaments.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.place.toLowerCase().includes(search.toLowerCase()),
  );

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen">
      <TopBar />

      <div className="px-4 pt-4 pb-2">
        <Badge variant="outline" className="text-primary border-primary/50 text-xs mb-3">
          Season 2024 Now Open
        </Badge>
        <h1 className="text-2xl font-bold leading-tight">
          Elevate Your Game<br />
          On The <span className="text-primary">Sand &amp; Hardwood</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Discover elite tournaments, track live brackets, and dominate the rankings.
        </p>
        <div className="flex gap-3 mt-4">
          <Button className="flex-1" asChild>
            <Link href="/discover">Find Tournaments →</Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/roster">Register Team</Link>
          </Button>
        </div>
      </div>

      <div className="px-4 mt-6 safe-pb">
        <Input
          placeholder="Search tournaments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Upcoming Tournaments</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              <SlidersHorizontal className="h-3 w-3" /> Filters
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              Sort by: Date <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No tournaments found.
          </div>
        ) : (
          <div className="space-y-4">
            {featured && <TournamentCard tournament={featured} variant="featured" />}
            {rest.map((t) => (
              <TournamentCard key={t._id} tournament={t} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
