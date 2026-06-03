'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface MapViewProps {
  placeName: string;
  placeAddress: string;
  placeUrl?: string;
}

export function MapView({ placeName, placeAddress, placeUrl }: MapViewProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

  useEffect(() => {
    const query = encodeURIComponent(`${placeName} ${placeAddress}`);
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1`
    )
      .then((r) => r.json())
      .then((data) => {
        const [lng, lat] = data.features?.[0]?.center ?? [];
        if (!lng || !lat) { setError(true); return; }
        const marker = `pin-s+6366f1(${lng},${lat})`;
        setImgUrl(
          `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${marker}/${lng},${lat},15,0/600x300@2x?access_token=${token}`
        );
      })
      .catch(() => setError(true));
  }, [placeName, placeAddress, token]);

  if (error) return (
    <p className="text-xs text-muted-foreground text-center py-4">Location not found</p>
  );

  if (!imgUrl) return (
    <div className="h-40 rounded-lg bg-secondary animate-pulse" />
  );

  const content = (
    <Image
      src={imgUrl}
      alt={placeName}
      width={600}
      height={300}
      className="w-full rounded-lg object-cover"
      unoptimized
    />
  );

  return placeUrl ? (
    <a href={placeUrl} target="_blank" rel="noopener noreferrer">{content}</a>
  ) : content;
}
