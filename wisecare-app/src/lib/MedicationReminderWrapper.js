'use client';

import dynamic from 'next/dynamic';
import { MedicationReminderProvider } from '@/lib/MedicationReminderService';

const MedicationReminderUI = dynamic(() => import('@/lib/MedicationReminderUI'), {
  ssr: false,
});

export default function MedicationReminderWrapper({ children }) {
  return (
    <MedicationReminderProvider>
      {children}
      <MedicationReminderUI />
    </MedicationReminderProvider>
  );
}
