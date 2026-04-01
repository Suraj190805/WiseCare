'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { MOCK_MEDICATIONS, MOCK_MED_LOGS, MOCK_USERS } from '@/lib/mockData';

// ─────────────────────────────────────────────────
// Medication Reminder Context & Service
// Handles: notifications, alarm sounds, escalation
// ─────────────────────────────────────────────────

const ReminderContext = createContext(null);

// ── Escalation stages ──
// Stage 1: Browser notification + in-app alert + alarm sound
// Stage 2: 2 min later — Simulated phone call to patient
// Stage 3: 2 min after that — Alert sent to Caregiver + Doctor
const ESCALATION_DELAYS = {
  NOTIFICATION: 0,           // Immediate
  CALL_PATIENT: 2 * 60 * 1000,  // 2 min after notification
  ALERT_CONTACTS: 4 * 60 * 1000, // 4 min after notification
};

// For demo purposes, use shorter delays (seconds instead of minutes)
const DEMO_ESCALATION_DELAYS = {
  NOTIFICATION: 0,
  CALL_PATIENT: 30 * 1000,     // 30 seconds
  ALERT_CONTACTS: 60 * 1000,   // 60 seconds
};

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

export function MedicationReminderProvider({ children }) {
  // ── State ──
  const [activeReminders, setActiveReminders] = useState([]);     // Currently firing reminders
  const [escalationLog, setEscalationLog] = useState([]);         // History of escalation events
  const [activeCallSimulation, setActiveCallSimulation] = useState(null); // Simulated incoming call
  const [contactAlerts, setContactAlerts] = useState([]);         // Alerts sent to caregiver/doctor
  const [notificationPermission, setNotificationPermission] = useState('unknown');
  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    soundEnabled: true,
    demoMode: true,  // Use shorter delays for hackathon demo
    escalationEnabled: true,
  });
  
  // ── Refs ──
  const escalationTimersRef = useRef({});  // medLogId -> { callTimer, alertTimer }
  const checkIntervalRef = useRef(null);
  // Load med logs from localStorage if available (keeps in sync with medications page)
  const medLogsRef = useRef(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wisecare_med_logs');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return MOCK_MED_LOGS;
  });
  const acknowledgedRef = useRef(new Set()); // Track acknowledged reminder IDs via ref
  // Load dismissed log IDs from localStorage so they survive refresh
  const dismissedLogIdsRef = useRef(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wisecare_dismissed_log_ids');
        if (stored) return new Set(JSON.parse(stored));
      } catch {}
    }
    return new Set();
  });
  const escalateToCallRef = useRef(null);     // Ref to latest escalateToCall function
  const escalateToContactsRef = useRef(null); // Ref to latest escalateToContacts function

  // Initialize refs (useRef with function doesn't auto-call it)
  if (typeof medLogsRef.current === 'function') {
    medLogsRef.current = medLogsRef.current();
  }
  if (typeof dismissedLogIdsRef.current === 'function') {
    dismissedLogIdsRef.current = dismissedLogIdsRef.current();
  }

  // Helper to persist dismissed IDs
  const persistDismissedIds = () => {
    try {
      localStorage.setItem('wisecare_dismissed_log_ids', JSON.stringify([...dismissedLogIdsRef.current]));
    } catch {}
  };

  // ── Request notification permission on mount ──
  useEffect(() => {
    requestNotificationPermission().then(granted => {
      setNotificationPermission(granted ? 'granted' : 'denied');
    });
  }, []);

  // ── Core: Check for due medications ──
  const checkMedications = useCallback(() => {
    if (!reminderSettings.enabled) return;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    // Re-sync from localStorage to stay in sync with medications page
    try {
      const stored = localStorage.getItem('wisecare_med_logs');
      if (stored) medLogsRef.current = JSON.parse(stored);
    } catch {}

    const pendingLogs = medLogsRef.current.filter(log => log.status === 'pending');
    
    pendingLogs.forEach(log => {
      // Skip logs that have already been dismissed/acknowledged
      if (dismissedLogIdsRef.current.has(log.id)) return;

      const med = MOCK_MEDICATIONS.find(m => m.id === log.medId);
      if (!med) return;
      
      // Check if it's time for this medication (within 1-minute window)
      if (log.time === currentTimeStr || isTimePast(log.time, currentTimeStr)) {
        // Only trigger if not already in active reminders
        if (!activeReminders.find(r => r.logId === log.id)) {
          triggerReminder(log, med);
        }
      }
    });
  }, [reminderSettings.enabled, activeReminders]);

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
    
    // Stage 1: Notification + Sound + In-App Alert
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

    // ── Setup escalation timers (use refs to avoid stale closures) ──
    if (reminderSettings.escalationEnabled) {
      const callTimer = setTimeout(() => {
        // Stage 2: Simulated phone call (call via ref for latest function)
        if (escalateToCallRef.current) {
          escalateToCallRef.current(reminderId, med, log);
        }
      }, delays.CALL_PATIENT);
      
      const alertTimer = setTimeout(() => {
        // Stage 3: Alert caregiver & doctor (call via ref for latest function)
        if (escalateToContactsRef.current) {
          escalateToContactsRef.current(reminderId, med, log);
        }
      }, delays.ALERT_CONTACTS);
      
      escalationTimersRef.current[reminderId] = { callTimer, alertTimer };
    }
  }, [reminderSettings]);

  // ── Stage 2: Simulate phone call to patient ──
  const escalateToCall = useCallback((reminderId, med, log) => {
    // Check if already acknowledged via ref (avoids stale closure)
    if (acknowledgedRef.current.has(reminderId)) return;

    // Update stage in state
    setActiveReminders(prev => {
      const reminder = prev.find(r => r.id === reminderId);
      if (!reminder || reminder.acknowledged) return prev;
      return prev.map(r => r.id === reminderId ? { ...r, stage: 2 } : r);
    });

    // Play urgent alarm
    playUrgentAlarm();

    // Show simulated incoming call UI
    setActiveCallSimulation({
      id: reminderId,
      medName: med.name,
      dosage: med.dosage,
      callerName: 'CareCompanion AI',
      callerLabel: 'Medication Reminder Call',
      startTime: new Date(),
    });

    // Browser notification for call
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
  }, []);

  // Keep refs up to date
  useEffect(() => {
    escalateToCallRef.current = escalateToCall;
  }, [escalateToCall]);

  // ── Stage 3: Alert caregiver & doctor ──
  const escalateToContacts = useCallback((reminderId, med, log) => {
    // Check if already acknowledged via ref
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

    // Create caregiver alert
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

    // Create doctor alert
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

    // Dismiss call overlay if still showing
    setActiveCallSimulation(null);

    // Browser notification
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
  }, []);

  // Keep refs up to date
  useEffect(() => {
    escalateToContactsRef.current = escalateToContacts;
  }, [escalateToContacts]);

  // ── Acknowledge a reminder (stops escalation) ──
  const acknowledgeReminder = useCallback((reminderId) => {
    // Mark as acknowledged in ref immediately (prevents escalation timers from firing)
    acknowledgedRef.current.add(reminderId);

    // Clear escalation timers
    const timers = escalationTimersRef.current[reminderId];
    if (timers) {
      clearTimeout(timers.callTimer);
      clearTimeout(timers.alertTimer);
      delete escalationTimersRef.current[reminderId];
    }

    // Update reminder state — get the medName before removing
    setActiveReminders(prev => {
      const reminder = prev.find(r => r.id === reminderId);
      if (reminder) {
        // Mark this log ID as dismissed so it never re-triggers
        dismissedLogIdsRef.current.add(reminder.logId);
        
        // Also mark the med log as taken in medLogsRef to prevent re-triggering
        medLogsRef.current = medLogsRef.current.map(l =>
          l.id === reminder.logId ? { ...l, status: 'taken' } : l
        );

        // Persist to localStorage so it survives refresh
        persistDismissedIds();
        try {
          localStorage.setItem('wisecare_med_logs', JSON.stringify(medLogsRef.current));
        } catch {}

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

    // Dismiss call simulation if showing
    setActiveCallSimulation(prev => 
      prev && prev.id === reminderId ? null : prev
    );

    // Remove from active after animation
    setTimeout(() => {
      setActiveReminders(prev => prev.filter(r => r.id !== reminderId));
    }, 500);
  }, []);

  // ── Dismiss call simulation ──
  const dismissCall = useCallback((reminderId) => {
    setActiveCallSimulation(null);
  }, []);

  // ── Answer call simulation ──
  const answerCall = useCallback((reminderId) => {
    setActiveCallSimulation(null);
    acknowledgeReminder(reminderId);
  }, [acknowledgeReminder]);

  // ── Trigger a demo reminder immediately (for testing) ──
  const triggerDemoReminder = useCallback((medId) => {
    const med = MOCK_MEDICATIONS.find(m => m.id === (medId || 'med_001'));
    if (!med) return;

    const fakeLog = {
      id: `demo_${Date.now()}`,
      medId: med.id,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'pending',
    };

    triggerReminder(fakeLog, med);
  }, [triggerReminder]);

  // ── Add to escalation log ──
  const addEscalationLog = (entry) => {
    setEscalationLog(prev => [entry, ...prev.slice(0, 49)]);
  };

  // ── Update med logs (called by medications page when status changes) ──
  const updateMedLogs = useCallback((newLogs) => {
    medLogsRef.current = newLogs;
  }, []);

  // ── Periodic check (every 30 seconds) ──
  useEffect(() => {
    if (!reminderSettings.enabled) return;
    
    checkIntervalRef.current = setInterval(checkMedications, 30000);
    // Also check immediately on mount
    checkMedications();
    
    return () => {
      clearInterval(checkIntervalRef.current);
      // Clear all escalation timers
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
    // Actions
    acknowledgeReminder,
    dismissCall,
    answerCall,
    triggerDemoReminder,
    updateMedLogs,
    setReminderSettings,
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const ctx = useContext(ReminderContext);
  if (!ctx) {
    // Return a no-op fallback if used outside provider
    return {
      activeReminders: [],
      escalationLog: [],
      activeCallSimulation: null,
      contactAlerts: [],
      notificationPermission: 'unknown',
      reminderSettings: { enabled: false },
      acknowledgeReminder: () => {},
      dismissCall: () => {},
      answerCall: () => {},
      triggerDemoReminder: () => {},
      updateMedLogs: () => {},
      setReminderSettings: () => {},
    };
  }
  return ctx;
}
