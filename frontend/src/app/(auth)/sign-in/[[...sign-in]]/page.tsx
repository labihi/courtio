import { SignIn } from '@clerk/nextjs';
import { getTranslations } from 'next-intl/server';
import { Logo } from '@/components/logo';

export default async function SignInPage() {
  const t = await getTranslations('auth.signIn');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8 gap-3">
          <Logo size="lg" />
          <p className="text-muted-foreground text-sm">{t('tagline')}</p>
        </div>
        <SignIn forceRedirectUrl="/discover" />
      </div>
    </div>
  );
}
