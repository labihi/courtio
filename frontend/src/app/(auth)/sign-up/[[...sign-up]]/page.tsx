import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Courtio</h1>
          <p className="text-muted-foreground mt-1">Join the volleyball community</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
