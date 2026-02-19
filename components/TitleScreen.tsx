'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { getGreetingKey } from '@/lib/greeting';
import { useStoryStore } from '@/lib/store';

interface TitleScreenProps {
  onBegin: () => void;
}

export default function TitleScreen({ onBegin }: TitleScreenProps) {
  const t = useTranslations();
  const childName = useStoryStore((s) => s.childName);
  const greetingKey = getGreetingKey();

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 px-8">
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center text-5xl font-bold text-accent-gold md:text-6xl"
        style={{ fontFamily: 'var(--font-heading), system-ui, sans-serif' }}
      >
        Evan&apos;s Story Studio
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center text-xl text-text-secondary md:text-2xl"
      >
        {t(greetingKey, { name: childName })}
      </motion.p>

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.6,
          type: 'spring',
          stiffness: 200,
          damping: 20,
        }}
        onClick={onBegin}
        className="mt-4 rounded-2xl bg-accent-purple px-10 py-5 text-xl font-semibold text-text-primary shadow-lg shadow-glow transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ minHeight: '64px' }}
      >
        {t('landing.cta')}
      </motion.button>

      {/* Settings gear icon (non-functional placeholder) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed bottom-6 right-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-secondary"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </motion.div>
    </div>
  );
}
