'use client';

import { useEffect } from 'react';
import { useStoryStore } from '@/lib/store';

export default function ThemeApplicator() {
  const theme = useStoryStore((s) => s.theme);
  const mode = useStoryStore((s) => s.mode);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.mode = mode;
  }, [theme, mode]);

  return null;
}
