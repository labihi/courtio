import { SignIn } from '@clerk/nextjs';
import { getTranslations } from 'next-intl/server';

export default async function SignInPage() {
  const t = await getTranslations('auth.signIn');

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Courtio</h1>
          <p className="text-muted-foreground mt-1">{t('tagline')}</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
