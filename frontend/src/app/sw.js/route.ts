import { NextResponse } from 'next/server';

const SW_CONTENT = `
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'Courtio', {
      body: data.body ?? '',
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      data: data.data ?? {},
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const tournamentId = event.notification.data?.tournamentId;
  const url = tournamentId ? '/tournaments/' + tournamentId : '/discover';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
`.trim();

export function GET() {
  return new NextResponse(SW_CONTENT, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-store',
    },
  });
}
