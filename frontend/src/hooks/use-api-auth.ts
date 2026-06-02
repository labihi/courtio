'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { registerTokenGetter } from '@/lib/api';

export function useApiAuth() {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    registerTokenGetter(getToken);
  }, [isLoaded, getToken]);
}
