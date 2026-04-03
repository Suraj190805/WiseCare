'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { MOCK_MEDICATIONS, MOCK_MED_LOGS, MOCK_USERS } from '@/lib/mockData';
import { useSharedData } from '@/lib/SharedDataStore';

// ─────────────────────────────────────────────────
// Medication Reminder Context & Service
// Handles: notifications, alarm sounds, voice alerts,
//          daily scheduling, escalation, due-time alerts
// ─────────────────────────────────────────────────

const ReminderContext = createContext(null);

// ── Escalation stages ──
// Stage 1: Browser notification + in-app alert + alarm sound + voice alert
// Stage 2: 2 min later — Simulated phone call to patient
// Stage 3: 2 min after that — Alert sent to Caregiver + Doctor
const ESCALATION_DELAYS = {
  NOTIFICATION: 0,
  CALL_PATIENT: 2 * 60 * 1000,
  ALERT_CONTACTS: 4 * 60 * 1000,
};

// For demo purposes, use shorter delays
const DEMO_ESCALATION_DELAYS = {
  NOTIFICATION: 0,
  CALL_PATIENT: 30 * 1000,
  ALERT_CONTACTS: 60 * 1000,
};

// ── Voice Alert System (Web Speech Synthesis) ──
function speakAlert(message, options = {}) {
  try {
    if (!('speechSynthesis' in window)) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = options.rate || 0.9; // Slightly slower for elderly users
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || 'en-IN';

    // Try to use a clear, natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google'))
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (e) {
    // Speech synthesis not supported
    return null;
  }
}

// Stop any ongoing speech
function stopSpeaking() {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {}
}

// Play alarm sound using Web Audio API
function playAlarmSound(duration = 2) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Create a two-tone alarm
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const startTime = ctx.currentTime + (i * 0.6);
      osc.frequency.setValueAtTime(800, startTime);
      osc.frequency.setValueAtTime(600, startTime + 0.3);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.55);
    }
  } catch (e) {
    // Web Audio not supported
  }
}

// Play urgent alarm (for escalation call)
function playUrgentAlarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      const startTime = ctx.currentTime + (i * 0.4);
      osc.frequency.setValueAtTime(1000, startTime);
      osc.frequency.setValueAtTime(700, startTime + 0.2);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    }
  } catch (e) {}
}

// Send browser notification
function sendBrowserNotification(title, body, tag, onClick) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '🩺',
      tag,
      requireInteraction: true,
      silent: false,
    });

    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }

    return notification;
  }
  return null;
}

// Request notification permission
async function requestNotificationPermission() {
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      return result === 'granted';
    }
    return Notification.permission === 'granted';
  }
  return false;
}

// ── Daily Scheduling Helpers ──
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function generateDailyLogs(medications, todayKey) {
  const logs = [];
  medications.forEach(med => {
    (med.times || []).forEach((time, idx) => {
      logs.push({
        id: `log_${todayKey}_${med.id}_${idx}`,
        medId: med.id,
        time,
        status: 'pending',
        date: todayKey,
      });
    });
  });
  return logs;
}

// ── Upcoming Reminder Helpers ──
function getMinutesUntil(timeStr) {
  const now = new Date();
  const [h, m] = timeStr.split(':').map(Number);
  const targetMinutes = h * 60 + m;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return targetMinutes - currentMinutes;
}

function formatTimeUntil(minutes) {
  if (minutes <= 0) return 'Now';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}


export function MedicationReminderProvider({ children }) {
  // ── Connect to SharedDataStore for Supabase persistence ──
  const { addAlert: persistAlert, addActivity: persistActivity } = useSharedData();

  // ── State ──
  const [activeReminders, setActiveReminders] = useState([]);
  const [escalationLog, setEscalationLog] = useState([]);
  const [activeCallSimulation, setActiveCallSimulation] = useState(null);
  const [contactAlerts, setContactAlerts] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState('unknown');
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [dailyScheduleGenerated, setDailyScheduleGenerated] = useState(false);
  const [reminderSettings, setReminderSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wisecare_reminder_settings');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return {
      enabled: true,
      soundEnabled: true,
      voiceEnabled: true,
      demoMode: true,
      escalationEnabled: true,
      dailyRemindersEnabled: true,
      preAlertMinutes: 5,        // Alert this many minutes before due time
      voiceLanguage: 'en-IN',
    };
  });

  // ── Refs ──
  const escalationTimersRef = useRef({});
  const checkIntervalRef = useRef(null);
  const preAlertTimersRef = useRef({});    // For pre-due-time alerts
  const dailyScheduleTimerRef = useRef(null);
  const triggeredLogIdsRef = useRef(new Set()); // Track log IDs that already triggered reminders
  const startupTimeRef = useRef(Date.now()); // Grace period: skip past-due meds on initial load
  const medLogsRef = useRef(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wisecare_med_logs');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return MOCK_MED_LOGS;
  });
  const acknowledgedRef = useRef(new Set());
  const dismissedLogIdsRef = useRef(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wisecare_dismissed_log_ids');
        if (stored) return new Set(JSON.parse(stored));
      } catch {}
    }
    return new Set();
  });
  const preAlertedRef = useRef(new Set()); // Track logs that got pre-alerts
  const voiceAlertedRef = useRef(new Set()); // Track logs that got voice daily summary
  const escalateToCallRef = useRef(null);
  const escalateToContactsRef = useRef(null);

  // Initialize refs
  if (typeof medLogsRef.current === 'function') {
    medLogsRef.current = medLogsRef.current();
  }
  if (typeof dismissedLogIdsRef.current === 'function') {
    dismissedLogIdsRef.current = dismissedLogIdsRef.current();
  }

  // Persist dismissed IDs
  const persistDismissedIds = () => {
    try {
      localStorage.setItem('wisecare_dismissed_log_ids', JSON.stringify([...dismissedLogIdsRef.current]));
    } catch {}
  };

  // Persist reminder settings
  useEffect(() => {
    try {
      localStorage.setItem('wisecare_reminder_settings', JSON.stringify(reminderSettings));
    } catch {}
  }, [reminderSettings]);

  // ── Check notification permission on mount (don't auto-request) ──
  useEffect(() => {
    // Just check current state — don't request (browsers block auto-request without user gesture)
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission); // 'default', 'granted', or 'denied'
    }

    // Poll for permission changes (updates after user clicks Allow)
    const permInterval = setInterval(() => {
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    }, 2000);

    // Preload voices for speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => clearInterval(permInterval);
  }, []);

  // ── Daily Schedule Generation ──
  // Auto-generate med logs for today if not already done
  useEffect(() => {
    if (!reminderSettings.dailyRemindersEnabled) return;

    const todayKey = getTodayKey();
    const lastGenDate = localStorage.getItem('wisecare_last_gen_date');

    if (lastGenDate !== todayKey) {
      // Load current medications
      let meds;
      try {
        const storedMeds = localStorage.getItem('wisecare_medications');
        meds = storedMeds ? JSON.parse(storedMeds) : MOCK_MEDICATIONS;
      } catch {
        meds = MOCK_MEDICATIONS;
      }

      const newLogs = generateDailyLogs(meds, todayKey);

      // Merge with existing logs (keep past logs, add new ones for today)
      const existingLogs = medLogsRef.current.filter(l => l.date !== todayKey && l.date !== 'today');
      const mergedLogs = [...existingLogs, ...newLogs];

      medLogsRef.current = mergedLogs;
      try {
        localStorage.setItem('wisecare_med_logs', JSON.stringify(mergedLogs));
        localStorage.setItem('wisecare_last_gen_date', todayKey);
      } catch {}

      // Clear dismissed IDs for new day
      dismissedLogIdsRef.current = new Set();
      persistDismissedIds();

      setDailyScheduleGenerated(true);

      // Voice announce disabled on auto-load to avoid flooding
      // User can still trigger speakDailySummary() manually

      addEscalationLog({
        type: 'notification',
        medName: 'Daily Schedule',
        message: `Daily medication schedule generated: ${newLogs.length} doses for today`,
        time: new Date(),
        stage: 0,
      });
    }

    // Set timer to regenerate at midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 10, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    dailyScheduleTimerRef.current = setTimeout(() => {
      // Forces a re-render which triggers the daily generation
      setDailyScheduleGenerated(false);
    }, msUntilMidnight);

    return () => {
      if (dailyScheduleTimerRef.current) clearTimeout(dailyScheduleTimerRef.current);
    };
  }, [reminderSettings.dailyRemindersEnabled, dailyScheduleGenerated]);

  // ── Detect newly-added medications mid-day ──
  // Poll localStorage for medication changes and auto-generate reminder logs
  useEffect(() => {
    if (!reminderSettings.dailyRemindersEnabled) return;

    let lastMedCount = 0;
    try {
      const storedMeds = localStorage.getItem('wisecare_medications');
      if (storedMeds) lastMedCount = JSON.parse(storedMeds).length;
    } catch {}

    const pollInterval = setInterval(() => {
      try {
        const storedMeds = localStorage.getItem('wisecare_medications');
        if (!storedMeds) return;
        const meds = JSON.parse(storedMeds);
        if (meds.length > lastMedCount) {
          // New medication(s) detected — ensure they have reminder logs
          const todayKey = getTodayKey();
          const storedLogs = localStorage.getItem('wisecare_med_logs');
          const currentLogs = storedLogs ? JSON.parse(storedLogs) : medLogsRef.current;
          const existingMedIds = new Set(currentLogs.map(l => l.medId));

          const newMeds = meds.filter(m => !existingMedIds.has(m.id));
          if (newMeds.length > 0) {
            const newLogs = generateDailyLogs(newMeds, todayKey);
            // Also normalize any 'today' date logs to actual date key
            const normalizedLogs = currentLogs.map(l =>
              l.date === 'today' ? { ...l, date: todayKey } : l
            );
            const mergedLogs = [...normalizedLogs, ...newLogs];
            medLogsRef.current = mergedLogs;
            localStorage.setItem('wisecare_med_logs', JSON.stringify(mergedLogs));

            addEscalationLog({
              type: 'notification',
              medName: newMeds.map(m => m.name).join(', '),
              message: `New medication(s) detected: ${newMeds.map(m => m.name).join(', ')} — reminders scheduled`,
              time: new Date(),
              stage: 0,
            });
          }
          lastMedCount = meds.length;
        }
      } catch {}
    }, 5000); // Check every 5 seconds for new medications

    return () => clearInterval(pollInterval);
  }, [reminderSettings.dailyRemindersEnabled]);

  // ── Upcoming Reminders Calculator ──
  const updateUpcomingReminders = useCallback(() => {
    try {
      const stored = localStorage.getItem('wisecare_med_logs');
      if (stored) medLogsRef.current = JSON.parse(stored);
    } catch {}

    // Load meds from localStorage for accuracy
    let meds;
    try {
      const storedMeds = localStorage.getItem('wisecare_medications');
      meds = storedMeds ? JSON.parse(storedMeds) : MOCK_MEDICATIONS;
    } catch {
      meds = MOCK_MEDICATIONS;
    }

    const pending = medLogsRef.current.filter(l => l.status === 'pending');
    const upcoming = pending
      .map(log => {
        const med = meds.find(m => m.id === log.medId);
        if (!med) return null;
        const minutesUntil = getMinutesUntil(log.time);
        return {
          ...log,
          medName: med.name,
          dosage: med.dosage,
          instructions: med.instructions,
          color: med.color,
          minutesUntil,
          timeFormatted: log.time,
          timeUntilFormatted: formatTimeUntil(minutesUntil),
          isDue: minutesUntil <= 0,
          isUpcoming: minutesUntil > 0 && minutesUntil <= 60,
          isSoon: minutesUntil > 0 && minutesUntil <= (reminderSettings.preAlertMinutes || 5),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.minutesUntil - b.minutesUntil);

    setUpcomingReminders(upcoming);

    // ── Pre-due-time voice alerts ──
    if (reminderSettings.voiceEnabled) {
      upcoming.forEach(item => {
        if (item.isSoon && !preAlertedRef.current.has(item.id) && !dismissedLogIdsRef.current.has(item.id)) {
          preAlertedRef.current.add(item.id);

          speakAlert(
            `Heads up! In ${item.minutesUntil} minutes, it will be time for ${item.medName}, ${item.dosage}. ${item.instructions}.`,
            { lang: reminderSettings.voiceLanguage }
          );

          sendBrowserNotification(
            `⏰ Coming up: ${item.medName}`,
            `${item.dosage} due in ${item.minutesUntil} minutes. ${item.instructions}`,
            `pre_${item.id}`
          );

          addEscalationLog({
            type: 'notification',
            medName: item.medName,
            message: `Pre-alert: ${item.medName} ${item.dosage} due in ${item.minutesUntil} min`,
            time: new Date(),
            stage: 0,
          });
        }
      });
    }
  }, [reminderSettings.voiceEnabled, reminderSettings.preAlertMinutes, reminderSettings.voiceLanguage]);

  // ── Core: Check for due medications ──
  const checkMedications = useCallback(() => {
    if (!reminderSettings.enabled) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    const todayKey = getTodayKey();

    // Re-sync from localStorage and normalize 'today' dates
    try {
      const stored = localStorage.getItem('wisecare_med_logs');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Normalize any logs with date: 'today' to actual date key
        medLogsRef.current = parsed.map(l =>
          l.date === 'today' ? { ...l, date: todayKey } : l
        );
      }
    } catch {}

    // Load meds
    let meds;
    try {
      const storedMeds = localStorage.getItem('wisecare_medications');
      meds = storedMeds ? JSON.parse(storedMeds) : MOCK_MEDICATIONS;
    } catch {
      meds = MOCK_MEDICATIONS;
    }

    const pendingLogs = medLogsRef.current.filter(log => log.status === 'pending');
    
    // Grace period: within the first 30 seconds after page load, skip past-due meds
    // This prevents the flood of reminders when opening the app
    const isStartupGrace = (Date.now() - startupTimeRef.current) < 30000;

    pendingLogs.forEach(log => {
      if (dismissedLogIdsRef.current.has(log.id)) return;
      if (triggeredLogIdsRef.current.has(log.id)) return;

      const med = meds.find(m => m.id === log.medId);
      if (!med) return;

      const isDueNow = log.time === currentTimeStr;

      if (isDueNow) {
        // Only trigger for medications due at this EXACT minute
        triggeredLogIdsRef.current.add(log.id);
        triggerReminder(log, med);
      } else if (isTimePast(log.time, currentTimeStr)) {
        // Past-due: silently mark as triggered so they NEVER pop up
        triggeredLogIdsRef.current.add(log.id);
      }
    });

    // Update upcoming reminders
    updateUpcomingReminders();
  }, [reminderSettings.enabled, updateUpcomingReminders]);

  // ── Check if scheduled time has passed ──
  function isTimePast(scheduledTime, currentTime) {
    const [sh, sm] = scheduledTime.split(':').map(Number);
    const [ch, cm] = currentTime.split(':').map(Number);
    return (ch * 60 + cm) > (sh * 60 + sm);
  }

  // ── Trigger a medication reminder ──
  const triggerReminder = useCallback((log, med) => {
    const reminderId = `reminder_${log.id}_${Date.now()}`;
    const delays = reminderSettings.demoMode ? DEMO_ESCALATION_DELAYS : ESCALATION_DELAYS;

    const reminder = {
      id: reminderId,
      logId: log.id,
      medId: med.id,
      medName: med.name,
      dosage: med.dosage,
      time: log.time,
      instructions: med.instructions,
      stage: 1,
      triggeredAt: new Date(),
      acknowledged: false,
    };

    setActiveReminders(prev => [...prev, reminder]);

    // Play alarm sound
    if (reminderSettings.soundEnabled) {
      playAlarmSound();
    }

    // 🔊 Voice Alert — Speak the medication reminder aloud
    if (reminderSettings.voiceEnabled) {
      setTimeout(() => {
        speakAlert(
          `Attention! It's time to take your medication. Please take ${med.name}, ${med.dosage}. ${med.instructions}. Tap the Taken button to confirm.`,
          { lang: reminderSettings.voiceLanguage, rate: 0.85 }
        );
      }, 2000); // Short delay so alarm sound finishes first
    }

    // Send browser notification
    sendBrowserNotification(
      `💊 Time for ${med.name}`,
      `${med.dosage} — ${med.instructions}. Tap to acknowledge.`,
      `med_${log.id}`,
      () => acknowledgeReminder(reminderId)
    );

    // Log the event
    addEscalationLog({
      type: 'notification',
      medName: med.name,
      message: `Reminder sent for ${med.name} ${med.dosage}`,
      time: new Date(),
      stage: 1,
    });

    // ── Setup escalation timers ──
    if (reminderSettings.escalationEnabled) {
      const callTimer = setTimeout(() => {
        if (escalateToCallRef.current) {
          escalateToCallRef.current(reminderId, med, log);
        }
      }, delays.CALL_PATIENT);

      const alertTimer = setTimeout(() => {
        if (escalateToContactsRef.current) {
          escalateToContactsRef.current(reminderId, med, log);
        }
      }, delays.ALERT_CONTACTS);

      escalationTimersRef.current[reminderId] = { callTimer, alertTimer };
    }
  }, [reminderSettings]);

  // ── Stage 2: Simulate phone call to patient ──
  const escalateToCall = useCallback((reminderId, med, log) => {
    if (acknowledgedRef.current.has(reminderId)) return;

    setActiveReminders(prev => {
      const reminder = prev.find(r => r.id === reminderId);
      if (!reminder || reminder.acknowledged) return prev;
      return prev.map(r => r.id === reminderId ? { ...r, stage: 2 } : r);
    });

    // Play urgent alarm
    playUrgentAlarm();

    // 🔊 Voice escalation alert
    if (reminderSettings.voiceEnabled) {
      setTimeout(() => {
        speakAlert(
          `Important! You have not taken ${med.name}, ${med.dosage}. This is a follow-up reminder. Please take your medication now.`,
          { lang: reminderSettings.voiceLanguage, rate: 0.85, pitch: 1.1 }
        );
      }, 2500);
    }

    // Show simulated incoming call UI
    setActiveCallSimulation({
      id: reminderId,
      medName: med.name,
      dosage: med.dosage,
      callerName: 'CareCompanion AI',
      callerLabel: 'Medication Reminder Call',
      startTime: new Date(),
    });

    sendBrowserNotification(
      `📞 Incoming Call — Medication Reminder`,
      `You haven't taken ${med.name} ${med.dosage}. Please take your medication.`,
      `call_${log.id}`
    );

    addEscalationLog({
      type: 'call',
      medName: med.name,
      message: `Auto-call initiated for missed ${med.name} ${med.dosage}`,
      time: new Date(),
      stage: 2,
    });
  }, [reminderSettings.voiceEnabled, reminderSettings.voiceLanguage]);

  useEffect(() => {
    escalateToCallRef.current = escalateToCall;
  }, [escalateToCall]);

  // ── Stage 3: Alert caregiver & doctor ──
  const escalateToContacts = useCallback((reminderId, med, log) => {
    if (acknowledgedRef.current.has(reminderId)) return;

    setActiveReminders(prev => {
      const reminder = prev.find(r => r.id === reminderId);
      if (!reminder || reminder.acknowledged) return prev;
      return prev.map(r => r.id === reminderId ? { ...r, stage: 3 } : r);
    });

    const patient = MOCK_USERS.patient;
    const caregiver = MOCK_USERS.caregiver;
    const doctor = MOCK_USERS.doctor;

    const alertTime = new Date();

    const caregiverAlert = {
      id: `ca_${Date.now()}`,
      recipient: 'caregiver',
      recipientName: caregiver.name,
      recipientRole: caregiver.relation,
      patientName: patient.name,
      medName: med.name,
      dosage: med.dosage,
      message: `⚠️ ${patient.name} has not taken ${med.name} ${med.dosage} (scheduled at ${log.time}). Multiple reminders and a call were sent but not acknowledged.`,
      time: alertTime,
      type: 'sms',
      status: 'sent',
    };

    const doctorAlert = {
      id: `da_${Date.now() + 1}`,
      recipient: 'doctor',
      recipientName: doctor.name,
      recipientRole: doctor.specialization,
      patientName: patient.name,
      medName: med.name,
      dosage: med.dosage,
      message: `🏥 Patient ${patient.name} missed ${med.name} ${med.dosage} (${log.time}). Escalated after notification + call with no response.`,
      time: alertTime,
      type: 'message',
      status: 'sent',
    };

    setContactAlerts(prev => [...prev, caregiverAlert, doctorAlert]);
    setActiveCallSimulation(null);

    // 🔊 Voice alert for escalation
    if (reminderSettings.voiceEnabled) {
      speakAlert(
        `Alert sent! ${patient.name} missed ${med.name}. Caregiver ${caregiver.name} and Doctor ${doctor.name} have been notified.`,
        { lang: reminderSettings.voiceLanguage }
      );
    }

    sendBrowserNotification(
      `🚨 Caregiver & Doctor Alerted`,
      `${patient.name} missed ${med.name}. ${caregiver.name} and ${doctor.name} have been notified.`,
      `escalate_${log.id}`
    );

    addEscalationLog({
      type: 'contact_alert',
      medName: med.name,
      message: `Caregiver (${caregiver.name}) and Doctor (${doctor.name}) alerted about missed ${med.name}`,
      time: alertTime,
      stage: 3,
    });
  }, [reminderSettings.voiceEnabled, reminderSettings.voiceLanguage]);

  useEffect(() => {
    escalateToContactsRef.current = escalateToContacts;
  }, [escalateToContacts]);

  // ── Acknowledge a reminder (stops escalation) ──
  const acknowledgeReminder = useCallback((reminderId) => {
    acknowledgedRef.current.add(reminderId);

    // Stop any ongoing voice alert
    stopSpeaking();

    // Clear escalation timers
    const timers = escalationTimersRef.current[reminderId];
    if (timers) {
      clearTimeout(timers.callTimer);
      clearTimeout(timers.alertTimer);
      delete escalationTimersRef.current[reminderId];
    }

    setActiveReminders(prev => {
      const reminder = prev.find(r => r.id === reminderId);
      if (reminder) {
        dismissedLogIdsRef.current.add(reminder.logId);

        medLogsRef.current = medLogsRef.current.map(l =>
          l.id === reminder.logId ? { ...l, status: 'taken' } : l
        );

        persistDismissedIds();
        try {
          localStorage.setItem('wisecare_med_logs', JSON.stringify(medLogsRef.current));
        } catch {}

        // 🔊 Voice confirmation
        if (reminderSettings.voiceEnabled) {
          speakAlert(
            `Great job! ${reminder.medName} has been marked as taken. Keep up the good work!`,
            { lang: reminderSettings.voiceLanguage }
          );
        }

        addEscalationLog({
          type: 'acknowledged',
          medName: reminder.medName || 'Medication',
          message: `Patient acknowledged ${reminder.medName} reminder`,
          time: new Date(),
          stage: 0,
        });
      }
      return prev.map(r => r.id === reminderId ? { ...r, acknowledged: true } : r);
    });

    setActiveCallSimulation(prev =>
      prev && prev.id === reminderId ? null : prev
    );

    setTimeout(() => {
      setActiveReminders(prev => prev.filter(r => r.id !== reminderId));
    }, 500);
  }, [reminderSettings.voiceEnabled, reminderSettings.voiceLanguage]);

  // ── Dismiss call simulation ──
  const dismissCall = useCallback((reminderId) => {
    setActiveCallSimulation(null);
  }, []);

  // ── Answer call simulation ──
  const answerCall = useCallback((reminderId) => {
    setActiveCallSimulation(null);
    acknowledgeReminder(reminderId);
  }, [acknowledgeReminder]);

  // ── Trigger a demo reminder immediately ──
  const triggerDemoReminder = useCallback((medId) => {
    let meds;
    try {
      const storedMeds = localStorage.getItem('wisecare_medications');
      meds = storedMeds ? JSON.parse(storedMeds) : MOCK_MEDICATIONS;
    } catch {
      meds = MOCK_MEDICATIONS;
    }

    const med = meds.find(m => m.id === (medId || 'med_001'));
    if (!med) return;

    const fakeLog = {
      id: `demo_${Date.now()}`,
      medId: med.id,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'pending',
    };

    triggerReminder(fakeLog, med);
  }, [triggerReminder]);

  // ── Speak daily summary on demand ──
  const speakDailySummary = useCallback(() => {
    if (!reminderSettings.voiceEnabled) return;

    let meds;
    try {
      const storedMeds = localStorage.getItem('wisecare_medications');
      meds = storedMeds ? JSON.parse(storedMeds) : MOCK_MEDICATIONS;
    } catch {
      meds = MOCK_MEDICATIONS;
    }

    const pending = upcomingReminders.filter(r => !r.isDue);
    const taken = medLogsRef.current.filter(l => l.status === 'taken');
    const total = medLogsRef.current.length;

    let message = `Here is your medication summary. `;
    message += `You have taken ${taken.length} out of ${total} doses today. `;

    if (pending.length > 0) {
      message += `Your next medication is ${pending[0].medName}, ${pending[0].dosage}, `;
      message += pending[0].minutesUntil > 0
        ? `due in ${pending[0].timeUntilFormatted}. `
        : `which is due now. `;
    } else {
      message += `You have completed all your medications for today. Great job! `;
    }

    speakAlert(message, { lang: reminderSettings.voiceLanguage, rate: 0.85 });
  }, [upcomingReminders, reminderSettings.voiceEnabled, reminderSettings.voiceLanguage]);

  // ── Add to escalation log + persist to Supabase ──
  const addEscalationLog = (entry) => {
    setEscalationLog(prev => [entry, ...prev.slice(0, 49)]);

    // Persist to Supabase via SharedDataStore
    if (persistAlert && entry.stage >= 1) {
      persistAlert({
        type: 'medication',
        message: entry.message,
        severity: entry.stage >= 3 ? 'danger' : entry.stage >= 2 ? 'warning' : 'info',
        source: 'reminder_service',
      });
    }
    if (persistActivity && entry.stage >= 1) {
      persistActivity({
        type: 'medication',
        message: entry.message,
        role: entry.type === 'contact_alert' ? 'system' : 'patient',
        icon: entry.stage >= 3 ? '🚨' : entry.stage >= 2 ? '📞' : '💊',
      });
    }
  };

  // ── Update med logs ──
  const updateMedLogs = useCallback((newLogs) => {
    medLogsRef.current = newLogs;
  }, []);

  // ── Periodic check (every 10 seconds for responsive reminders) ──
  useEffect(() => {
    if (!reminderSettings.enabled) return;

    checkIntervalRef.current = setInterval(checkMedications, 10000);
    checkMedications();

    return () => {
      clearInterval(checkIntervalRef.current);
      Object.values(escalationTimersRef.current).forEach(t => {
        clearTimeout(t.callTimer);
        clearTimeout(t.alertTimer);
      });
    };
  }, [reminderSettings.enabled, checkMedications]);

  const value = {
    // State
    activeReminders,
    escalationLog,
    activeCallSimulation,
    contactAlerts,
    notificationPermission,
    reminderSettings,
    upcomingReminders,
    dailyScheduleGenerated,
    // Actions
    acknowledgeReminder,
    dismissCall,
    answerCall,
    triggerDemoReminder,
    updateMedLogs,
    setReminderSettings,
    speakDailySummary,
    speakAlert,
    stopSpeaking,
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
}

function getGreetingTime() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export function useReminders() {
  const ctx = useContext(ReminderContext);
  if (!ctx) {
    return {
      activeReminders: [],
      escalationLog: [],
      activeCallSimulation: null,
      contactAlerts: [],
      notificationPermission: 'unknown',
      reminderSettings: { enabled: false },
      upcomingReminders: [],
      dailyScheduleGenerated: false,
      acknowledgeReminder: () => {},
      dismissCall: () => {},
      answerCall: () => {},
      triggerDemoReminder: () => {},
      updateMedLogs: () => {},
      setReminderSettings: () => {},
      speakDailySummary: () => {},
      speakAlert: () => {},
      stopSpeaking: () => {},
    };
  }
  return ctx;
}
