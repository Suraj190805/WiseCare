'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled since Web Speech API is browser-only
const VoiceNavigation = dynamic(() => import('@/lib/VoiceNavigation'), {
  ssr: false,
});

export default function VoiceNavigationWrapper() {
  return <VoiceNavigation />;
}
