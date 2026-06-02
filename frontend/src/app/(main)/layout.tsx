import { BottomNav } from '@/components/layout/bottom-nav';
import { ApiAuthProvider } from '@/components/providers/api-auth-provider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ApiAuthProvider>
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 safe-pb">{children}</main>
        <BottomNav />
      </div>
    </ApiAuthProvider>
  );
}
