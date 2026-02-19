'use client';

import { useTranslations } from 'next-intl';
import { getGreetingKey } from '@/lib/greeting';

export default function Home() {
  const t = useTranslations();
  const greetingKey = getGreetingKey();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-5xl font-bold text-accent-gold">
        Evan&apos;s Story Studio
      </h1>

      <p className="text-xl text-text-secondary">
        {t(greetingKey, { name: 'Evan' })}
      </p>

      <p className="text-lg text-text-secondary">
        {t('landing.subtitle')}
      </p>

      <button
        type="button"
        className="rounded-button bg-accent-purple px-8 py-4 text-lg font-semibold text-text-primary transition-transform hover:scale-105 active:scale-95"
      >
        {t('landing.cta')}
      </button>

      <p className="mt-8 text-sm text-text-secondary">
        Temporary landing page &mdash; Plan 02 will replace this with the full
        language picker and title screen flow.
      </p>
    </div>
  );
}
