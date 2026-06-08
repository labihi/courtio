'use client';

import { useEffect, useState } from 'react';
import { notificationsApi } from '@/lib/api';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer;
}

async function doSubscribe() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) return;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const registration = await navigator.serviceWorker.register('/sw.js');
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }
  await notificationsApi.subscribe(subscription.toJSON());
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setPermission(Notification.permission);

    // If already granted, subscribe silently (no prompt needed)
    if (Notification.permission === 'granted') {
      doSubscribe().catch((err) => console.error('[push] subscribe failed:', err));
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      await doSubscribe().catch((err) => console.error('[push] subscribe failed:', err));
    }
  };

  return { permission, requestPermission };
}
