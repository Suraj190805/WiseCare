import './globals.css';
import VoiceNavigationWrapper from '@/lib/VoiceNavigationWrapper';
import MedicationReminderWrapper from '@/lib/MedicationReminderWrapper';

export const metadata = {
  title: 'CareCompanion AI — Smart Elderly Care Platform',
  description: 'Intelligent, voice-first healthcare companion for elderly individuals. AI-powered medication management, emergency SOS, live location, and seamless connectivity with caregivers and doctors.',
  keywords: 'elderly care, AI healthcare, medication reminder, emergency SOS, caregiver, telehealth',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🩺</text></svg>" />
      </head>
      <body>
        <MedicationReminderWrapper>
          {children}
        </MedicationReminderWrapper>
        <VoiceNavigationWrapper />
      </body>
    </html>
  );
}
