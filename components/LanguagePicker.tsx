'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

interface LanguagePickerProps {
  onSelect: () => void;
}

const languages = [
  { locale: 'fr', flag: '\uD83C\uDDEB\uD83C\uDDF7', name: 'Fran\u00e7ais' },
  { locale: 'en', flag: '\uD83C\uDDEC\uD83C\uDDE7', name: 'English' },
  { locale: 'uk', flag: '\uD83C\uDDFA\uD83C\uDDE6', name: '\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430' },
] as const;

export default function LanguagePicker({ onSelect }: LanguagePickerProps) {
  const router = useRouter();

  const handleSelect = (locale: string) => {
    document.cookie = `locale=${locale};path=/;SameSite=Lax`;
    router.refresh();
    onSelect();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 px-8">
        {languages.map((lang, index) => (
          <motion.button
            key={lang.locale}
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.1 + index * 0.15,
              duration: 0.4,
              type: 'spring',
              stiffness: 200,
              damping: 20,
            }}
            onClick={() => handleSelect(lang.locale)}
            className="flex w-72 items-center justify-center gap-4 rounded-2xl border-2 border-transparent bg-card-bg px-8 py-6 text-2xl font-semibold text-text-primary backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-accent-gold active:scale-95"
            style={{ minHeight: '80px' }}
          >
            <span className="text-3xl">{lang.flag}</span>
            <span>{lang.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
