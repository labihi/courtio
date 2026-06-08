import Link from 'next/link';
import { Logo } from '@/components/logo';

export const metadata = {
  title: 'Terms of Service – Courtio',
};

const LAST_UPDATED = 'June 8, 2025';
const CONTACT_EMAIL = 'legal@courtio.app';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/sign-in">
            <Logo size="sm" />
          </Link>
          <span className="text-xs text-muted-foreground">Last updated {LAST_UPDATED}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">
            These terms govern your use of Courtio, a platform for organising and joining
            volleyball tournaments. By creating an account or using the platform you agree to
            these terms in full. If you do not agree, do not use Courtio.
          </p>
        </div>

        <Section title="1. The service">
          <p>
            Courtio provides tools to discover tournaments, register teams and individual
            players, manage rosters, and communicate within a volleyball community. The platform
            is accessible at <span className="text-primary">app.courtio.online</span>.
          </p>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the service at
            any time without prior notice. We are not liable for any interruption or
            discontinuation of the service.
          </p>
        </Section>

        <Section title="2. Accounts">
          <p>
            To use Courtio you must create an account via Clerk, our authentication provider.
            You are responsible for:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Providing accurate registration information.</li>
            <li>Keeping your credentials confidential.</li>
            <li>All activity that occurs under your account.</li>
          </ul>
          <p>
            You must be at least 13 years old to create an account. If you are under 18, you
            confirm that a parent or guardian has reviewed and consented to these terms.
          </p>
          <p>
            We reserve the right to suspend or delete accounts that violate these terms, are
            inactive for an extended period, or are used for fraudulent purposes.
          </p>
        </Section>

        <Section title="3. Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Use the platform for any unlawful purpose.</li>
            <li>
              Post content that is defamatory, harassing, obscene, or otherwise objectionable.
            </li>
            <li>
              Attempt to gain unauthorised access to other accounts or backend systems.
            </li>
            <li>
              Scrape, crawl, or otherwise extract data from the platform in an automated manner
              without written consent.
            </li>
            <li>
              Impersonate another user, team, or organisation.
            </li>
            <li>
              Manipulate tournament registrations (e.g. creating fake teams or players to
              reserve slots).
            </li>
          </ul>
          <p>
            Violation of these rules may result in immediate account suspension without refund
            of any fees paid.
          </p>
        </Section>

        <Section title="4. Tournaments and registrations">
          <p>
            Tournament organisers are responsible for the accuracy of the information they
            publish (dates, venues, fees, rules). Courtio does not organise tournaments and is
            not liable for cancellations, changes, or disputes between participants and
            organisers.
          </p>
          <p>
            When registering for a tournament, you confirm that all team members have consented
            to participate. Cancelling a registration releases the slot for other participants
            and may be subject to the organiser&apos;s own cancellation policy.
          </p>
        </Section>

        <Section title="5. User content">
          <p>
            You may upload images (profile pictures, team logos) to the platform. By uploading
            content you grant Courtio a non-exclusive, royalty-free, worldwide licence to store,
            display, and reproduce that content solely for the purpose of operating the service.
          </p>
          <p>
            You retain ownership of your content. You represent that you have the right to
            upload it and that it does not infringe any third-party intellectual property rights.
          </p>
          <p>
            We reserve the right to remove content that violates these terms or applicable law.
          </p>
        </Section>

        <Section title="6. Notifications">
          <p>
            By enabling push notifications, you consent to receiving alerts about new
            tournaments and platform activity. You can disable notifications at any time via
            your browser settings. Service-related emails from Clerk (e.g. password resets) are
            not marketing communications and cannot be opted out of while you hold an active
            account.
          </p>
        </Section>

        <Section title="7. Intellectual property">
          <p>
            The Courtio name, logo, and all platform code and design are the property of
            Courtio and may not be reproduced, distributed, or used for commercial purposes
            without written permission.
          </p>
        </Section>

        <Section title="8. Limitation of liability">
          <p>
            To the maximum extent permitted by applicable law, Courtio and its operators are
            not liable for:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Any indirect, incidental, or consequential damages arising from your use of the platform.</li>
            <li>Loss of data, revenue, or goodwill.</li>
            <li>Injuries or damages occurring at physical tournaments listed on the platform.</li>
            <li>Actions or omissions of third-party services (Clerk, Cloudinary, Mapbox).</li>
          </ul>
          <p>
            Our total liability for any claim arising from these terms shall not exceed the
            amount you paid to use the platform in the 12 months preceding the claim, or €50,
            whichever is lower.
          </p>
        </Section>

        <Section title="9. Governing law">
          <p>
            These terms are governed by and construed in accordance with the laws of Italy.
            Any disputes shall be subject to the exclusive jurisdiction of the courts of Italy,
            without prejudice to your rights as a consumer under mandatory EU consumer
            protection law.
          </p>
        </Section>

        <Section title="10. Changes to these terms">
          <p>
            We may revise these terms at any time. The &quot;Last updated&quot; date at the top
            reflects the most recent revision. Continued use of Courtio after a change
            constitutes acceptance of the updated terms. For material changes we will make
            reasonable efforts to notify active users.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            For questions about these terms, contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <div className="border-t border-border pt-6 text-sm text-muted-foreground flex flex-wrap gap-4">
          <Link href="/privacy" className="text-primary underline hover:opacity-80 transition-opacity">
            Privacy Policy
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline hover:opacity-80 transition-opacity">
            {CONTACT_EMAIL}
          </a>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}
