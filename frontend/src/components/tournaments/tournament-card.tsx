'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, Users } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
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
  const locale = useLocale();
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
            </div>
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-xl font-bold">{tournament.name}</h3>
              <Badge variant={STATUS_VARIANTS[tournament.status] ?? 'secondary'} className="shrink-0 mt-0.5">
                {t(`status.${tournament.status}`)}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {tournament.place.placeName}
            </div>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(tournament.dateTime, locale)}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{t('remainingSlots')}</p>
                <p className="text-sm font-semibold">
                  {t('teamsCount', { spots: spotsLeft, max: tournament.maxTeamSlots })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {tournament.price > 0
                    ? t('entryFee', { price: formatCurrency(tournament.price, locale) })
                    : t('free')}
                </p>
                <Button size="sm" className="mt-1" disabled={tournament.status === 'FULL'}>
                  {tournament.status === 'FULL' ? t('full') : t('registerNow')}
                </Button>
              </div>
            </div>
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
          </div>
        )}
        <div className="p-4">
          <h3 className="font-bold text-base">{tournament.name}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <MapPin className="h-3.5 w-3.5" />
            {tournament.place.placeName}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(tournament.dateTime, locale)}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANTS[tournament.status] ?? 'secondary'}>
                {t(`status.${tournament.status}`)}
              </Badge>
              {tournament.status === 'OPEN' && spotsLeft > 0 && (
                <span className="text-xs text-muted-foreground">{t('slotsLeft', { spots: spotsLeft })}</span>
              )}
            </div>
            <span className="text-sm font-medium">
              {tournament.price > 0
                ? t('entryFee', { price: formatCurrency(tournament.price, locale) })
                : t('free')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
