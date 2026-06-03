'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Calendar, Zap, Share2, Users } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { TopBar } from '@/components/layout/top-bar';
import { Button } from '@/components/ui/button';
import { RegisterDialog } from '@/components/tournaments/register-dialog';
import { MapView } from '@/components/tournaments/map-view';
import { tournamentApi } from '@/lib/api';
import { Tournament } from '@/types';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export default function TournamentDetailPage() {
  const t = useTranslations('tournament');
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerType, setRegisterType] = useState<'team' | 'solo'>('solo');

  useEffect(() => {
    tournamentApi
      .getById(id)
      .then((res) => setTournament(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar showBack backHref="/discover" />
        <div className="h-48 bg-secondary animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-8 bg-secondary rounded animate-pulse" />
          <div className="h-4 bg-secondary rounded animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  if (!tournament) return null;

  const spotsLeft = tournament.maxTeamSlots - (tournament.registeredTeams?.length ?? 0);
  const isFull = tournament.status === 'FULL' || spotsLeft <= 0;

  return (
    <div className="min-h-screen">
      <TopBar
        showBack
        backHref="/discover"
        actions={
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
        }
      />

      {tournament.imageUrl && (
        <div className="relative h-52 w-full">
          <Image src={tournament.imageUrl} alt={tournament.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>
      )}

      <div className="px-4 py-4 safe-pb space-y-4">
        <div>
          <h1 className="text-2xl font-bold">{tournament.name}</h1>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <Calendar className="h-4 w-4" />
            {formatDateTime(tournament.dateTime, locale)}
          </div>
        </div>
        {!isFull && spotsLeft <= 3 && (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <Zap className="h-4 w-4 text-orange-400 shrink-0" />
            <p className="text-sm text-orange-300 font-medium">
              {t('urgentSlots', {
                count: spotsLeft,
                registered: tournament.registeredTeams?.length ?? 0,
              })}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('formatLabel')}</p>
            <p className="font-bold text-base">{tournament.format}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t('skillLevelLabel')}</p>
            <p className="font-bold text-base">{tournament.skillLevel}</p>
          </div>
        </div>

        {tournament.description && (
          <div>
            <h2 className="font-bold text-lg border-l-4 border-primary pl-3 mb-2">
              {t('overviewTitle')}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tournament.description}
            </p>
            {/* <ul className="mt-3 space-y-1.5">
              {([t('feature1'), t('feature2'), t('feature3')] as string[]).map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span> {item}
                </li>
              ))}
            </ul> */}
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <MapPin className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">{t('locationLabel')}</span>
          </div>
          {tournament.place.placeUrl ? (
            <a
              href={tournament.place.placeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              {tournament.place.placeName}
            </a>
          ) : (
            <p className="text-sm font-medium text-primary">{tournament.place.placeName}</p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">{tournament.place.placeAddress}</p>
          <MapView
            placeName={tournament.place.placeName}
            placeAddress={tournament.place.placeAddress}
            placeUrl={tournament.place.placeUrl}
            lat={tournament.place.lat}
            lng={tournament.place.lng}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('entryFee', { price: formatCurrency(tournament.price, locale) })}</span>
          <span>{t('slotsRemaining', { remaining: spotsLeft, max: tournament.maxTeamSlots })}</span>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            className="w-full gap-2"
            size="lg"
            disabled={isFull}
            onClick={() => { setRegisterType('team'); setRegisterOpen(true); }}
          >
            <Users className="h-5 w-5" />
            {t('joinAsTeam')}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => { setRegisterType('solo'); setRegisterOpen(true); }}
          >
            {t('joinSolo')}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {tournament.registrationCloseDateTime
              ? t('registrationCloses', { date: formatDateTime(tournament.registrationCloseDateTime, locale) })
              : t('registrationClosesFull')}
          </p>
        </div>
      </div>

      {tournament && (
        <RegisterDialog
          tournament={tournament}
          type={registerType}
          open={registerOpen}
          onOpenChange={setRegisterOpen}
        />
      )}
    </div>
  );
}
