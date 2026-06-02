'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tournament } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';

interface TournamentCardProps {
  tournament: Tournament;
  variant?: 'featured' | 'compact';
}

const STATUS_VARIANTS = {
  OPEN: 'success',
  UPCOMING: 'secondary',
  FULL: 'destructive',
  ONGOING: 'default',
  COMPLETED: 'outline',
  CANCELLED: 'outline',
} as const;

export function TournamentCard({ tournament, variant = 'compact' }: TournamentCardProps) {
  const t = useTranslations('tournamentCard');
  const spotsLeft = tournament.maxTeamSlots - (tournament.registeredTeams?.length ?? 0);

  if (variant === 'featured') {
    return (
      <Link href={`/tournaments/${tournament._id}`} className="block">
        <div className="relative rounded-xl overflow-hidden bg-card border border-border">
          {tournament.imageUrl && (
            <div className="relative h-44 w-full">
              <Image
                src={tournament.imageUrl}
                alt={tournament.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge variant="default" className="uppercase text-[10px] tracking-wider">
                  {t('majorChampionship')}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
                <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {tournament.place}
                </div>
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(tournament.dateTime)}
                </div>
              </div>
            </div>
          )}
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('remainingSlots')}</p>
              <p className="text-sm font-semibold">
                {t('teamsCount', { spots: spotsLeft, max: tournament.maxTeamSlots })}
              </p>
            </div>
            <Button size="sm" disabled={tournament.status === 'FULL'}>
              {tournament.status === 'FULL' ? t('full') : t('registerNow')}
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/tournaments/${tournament._id}`} className="block">
      <div className="relative rounded-xl overflow-hidden bg-card border border-border">
        {tournament.imageUrl && (
          <div className="relative h-36 w-full">
            <Image
              src={tournament.imageUrl}
              alt={tournament.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            {tournament.price > 0 && (
              <Badge className="absolute top-3 right-3 bg-black/60 text-white border-none">
                {t('perTeam', { price: formatCurrency(tournament.price) })}
              </Badge>
            )}
          </div>
        )}
        <div className="p-4">
          <h3 className="font-bold text-base">{tournament.name}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {tournament.place}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(tournament.dateTime)}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Badge variant={STATUS_VARIANTS[tournament.status] ?? 'secondary'}>
              {tournament.status === 'OPEN' && spotsLeft > 0
                ? t('slotsLeft', { spots: spotsLeft })
                : tournament.status}
            </Badge>
            <span className="text-xs text-muted-foreground">{tournament.format}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
