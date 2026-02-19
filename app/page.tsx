'use client';

import { useState } from 'react';
import LanguagePicker from '@/components/LanguagePicker';
import TitleScreen from '@/components/TitleScreen';

type ScreenState = 'language-picker' | 'title-screen';

export default function Home() {
  const [screen, setScreen] = useState<ScreenState>('language-picker');

  if (screen === 'language-picker') {
    return <LanguagePicker onSelect={() => setScreen('title-screen')} />;
  }

  return (
    <TitleScreen
      onBegin={() => {
        // Future: navigate to /story (Phase 3 character picker)
        console.log('Begin adventure clicked');
      }}
    />
  );
}
