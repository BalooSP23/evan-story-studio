'use client';

import { useEffect } from 'react';
import { useStoryStore } from '@/lib/store';

export default function StoreHydration() {
  useEffect(() => {
    useStoryStore.persist.rehydrate();
  }, []);

  return null;
}
