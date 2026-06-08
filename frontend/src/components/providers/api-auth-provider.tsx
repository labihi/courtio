'use client';

import { useApiAuth } from '@/hooks/use-api-auth';

export function ApiAuthProvider({ children }: { children: React.ReactNode }) {
  useApiAuth();
  return <>{children}</>;
}
