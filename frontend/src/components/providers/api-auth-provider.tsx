'use client';

import { useApiAuth } from '@/hooks/use-api-auth';
import { usePushNotifications } from '@/hooks/use-push-notifications';

export function ApiAuthProvider({ children }: { children: React.ReactNode }) {
  useApiAuth();
  usePushNotifications();
  return <>{children}</>;
}
