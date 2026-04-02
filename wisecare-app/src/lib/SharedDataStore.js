'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MOCK_MEDICATIONS, MOCK_MED_LOGS, MOCK_VITALS, MOCK_ALERTS, MOCK_APPOINTMENTS } from './mockData';

const SharedDataContext = createContext();

// Check-in schedule: 3 times a day
const CHECKIN_SCHEDULE = [
  { id: 'morning', label: 'Morning', startHour: 6, endHour: 11 },
  { id: 'afternoon', label: 'Afternoon', startHour: 11, endHour: 17 },
  { id: 'evening', label: 'Evening', startHour: 17, endHour: 23 },
];

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getCurrentCheckinSlot() {
  const hour = new Date().getHours();
  return CHECKIN_SCHEDULE.find(s => hour >= s.startHour && hour < s.endHour) || null;
}

function getMissedSlots(checkins) {
  const todayKey = getTodayKey();
  const todayCheckins = checkins.filter(c => c.date === todayKey);
  const completedSlotIds = todayCheckins.map(c => c.slotId);
  const hour = new Date().getHours();
  return CHECKIN_SCHEDULE.filter(slot => hour >= slot.endHour && !completedSlotIds.includes(slot.id));
}

// Fallback defaults (used if API fails)
const DEFAULT_ALERTS = MOCK_ALERTS.map(a => ({
  ...a,
  source: 'system',
  timestamp: Date.now() - Math.random() * 86400000,
}));

const DEFAULT_ACTIVITY = [
  { id: 'act_1', type: 'medication', message: 'Rajan took Metformin 500mg (morning dose)', role: 'patient', icon: '💊', timestamp: Date.now() - 3600000 },
  { id: 'act_2', type: 'vitals', message: 'Blood sugar reading recorded: 142 mg/dL', role: 'patient', icon: '🩸', timestamp: Date.now() - 7200000 },
  { id: 'act_3', type: 'appointment', message: 'Dr. Priya confirmed appointment for today at 3:00 PM', role: 'doctor', icon: '📅', timestamp: Date.now() - 10800000 },
  { id: 'act_4', type: 'note', message: "Meera checked in on Rajan's medication status", role: 'caregiver', icon: '👁', timestamp: Date.now() - 14400000 },
];

const DEFAULT_MESSAGES = [
  { id: 'msg_1', from: 'doctor', fromName: 'Dr. Priya Sharma', to: 'caregiver', toName: 'Meera Kumar', text: "Rajan's blood sugar is trending down nicely. Continue monitoring.", timestamp: Date.now() - 7200000, read: true },
  { id: 'msg_2', from: 'caregiver', fromName: 'Meera Kumar', to: 'doctor', toName: 'Dr. Priya Sharma', text: "He's been following the diet plan well this week. Will keep an eye on evening doses.", timestamp: Date.now() - 3600000, read: true },
  { id: 'msg_3', from: 'doctor', fromName: 'Dr. Priya Sharma', to: 'patient', toName: 'Rajan Kumar', text: 'Good job on your morning walks, Rajan! Keep it up 👍', timestamp: Date.now() - 1800000, read: false },
];

// API helper
async function api(path, options = {}) {
  try {
    const res = await fetch(`/api/${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`API call failed: /api/${path}`, err);
    return null;
  }
}

export function SharedDataProvider({ children }) {
  const [medications, setMedications] = useState([...MOCK_MEDICATIONS]);
  const [medLogs, setMedLogs] = useState([...MOCK_MED_LOGS]);
  const [vitals, setVitals] = useState({ ...MOCK_VITALS });
  const [alerts, setAlerts] = useState(DEFAULT_ALERTS);
  const [appointments, setAppointments] = useState([...MOCK_APPOINTMENTS]);
  const [doctorNotes, setDoctorNotes] = useState([]);
  const [patientLocation, setPatientLocation] = useState(null);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [activityFeed, setActivityFeed] = useState(DEFAULT_ACTIVITY);
  const [checkins, setCheckins] = useState([]);
  const [dbReady, setDbReady] = useState(false);
  const seeded = useRef(false);

  // === Sync medications & medLogs to localStorage for MedicationReminderService ===
  useEffect(() => {
    try {
      localStorage.setItem('wisecare_medications', JSON.stringify(medications));
    } catch {}
  }, [medications]);

  useEffect(() => {
    try {
      localStorage.setItem('wisecare_med_logs', JSON.stringify(medLogs));
    } catch {}
  }, [medLogs]);

  // === Initialize: Seed DB then load all data from Supabase ===
  useEffect(() => {
    async function init() {
      if (seeded.current) return;
      seeded.current = true;

      // Seed the database (idempotent — only inserts if empty)
      await api('seed', { method: 'POST' });

      // Load all data from MongoDB in parallel
      const [meds, logs, vit, alt, apts, notes, msgs, acts, ckins] = await Promise.all([
        api('medications'),
        api('med-logs'),
        api('vitals'),
        api('alerts'),
        api('appointments'),
        api('doctor-notes'),
        api('messages'),
        api('activities'),
        api('check-ins'),
      ]);

      if (meds) setMedications(meds);
      if (logs) setMedLogs(logs);
      if (vit && Object.keys(vit).length > 0) setVitals(vit);
      if (alt) setAlerts(alt);
      if (apts) setAppointments(apts);
      if (notes) setDoctorNotes(notes);
      if (msgs) setMessages(msgs);
      if (acts) setActivityFeed(acts);
      if (ckins) setCheckins(ckins);

      setDbReady(true);
    }
    init();
  }, []);

  // === Activity Feed ===
  const addActivity = useCallback(async (entry) => {
    const newEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      ...entry,
    };
    setActivityFeed(prev => [newEntry, ...prev].slice(0, 50));
    // Persist to DB
    api('activities', { method: 'POST', body: JSON.stringify(newEntry) });
    return newEntry;
  }, []);

  // === Medication actions ===
  const takeMed = useCallback(async (logId) => {
    setMedLogs(prev => {
      const log = prev.find(l => l.id === logId);
      if (log) {
        const med = medications.find(m => m.id === log.medId);
        if (med) {
          addActivity({ type: 'medication', message: `Rajan took ${med.name} ${med.dosage} (${log.time} dose)`, role: 'patient', icon: '💊' });
        }
      }
      return prev.map(l => l.id === logId ? { ...l, status: 'taken' } : l);
    });
    api('med-logs', { method: 'PATCH', body: JSON.stringify({ id: logId, status: 'taken' }) });
  }, [medications, addActivity]);

  const skipMed = useCallback(async (logId) => {
    setMedLogs(prev => {
      const log = prev.find(l => l.id === logId);
      if (log) {
        const med = medications.find(m => m.id === log.medId);
        if (med) {
          addAlert({
            type: 'medication',
            message: `${med.name} ${med.dosage} dose skipped at ${log.time}`,
            severity: 'warning',
            source: 'patient',
          });
          addActivity({ type: 'medication', message: `⚠ Rajan skipped ${med.name} ${med.dosage} (${log.time} dose)`, role: 'patient', icon: '⚠️' });
        }
      }
      return prev.map(l => l.id === logId ? { ...l, status: 'skipped' } : l);
    });
    api('med-logs', { method: 'PATCH', body: JSON.stringify({ id: logId, status: 'skipped' }) });
  }, [medications]);

  const addMedication = useCallback(async (med) => {
    const newMed = { id: med.id || `med_${Date.now()}`, ...med };
    setMedications(prev => [...prev, newMed]);
    addActivity({ type: 'medication', message: `New medication added: ${med.name} ${med.dosage}`, role: med.prescribedBy === 'doctor' ? 'doctor' : 'patient', icon: '💊' });
    api('medications', { method: 'POST', body: JSON.stringify(newMed) });
  }, [addActivity]);

  const removeMedication = useCallback(async (medId) => {
    setMedications(prev => {
      const med = prev.find(m => m.id === medId);
      if (med) {
        addActivity({ type: 'medication', message: `Medication discontinued: ${med.name} ${med.dosage}`, role: 'doctor', icon: '🚫' });
      }
      return prev.filter(m => m.id !== medId);
    });
    setMedLogs(prev => prev.filter(l => l.medId !== medId));
    api(`medications?id=${medId}`, { method: 'DELETE' });
    api(`med-logs?medId=${medId}`, { method: 'DELETE' });
  }, [addActivity]);

  const addMedLogs = useCallback(async (logs) => {
    setMedLogs(prev => [...prev, ...logs]);
    api('med-logs', { method: 'POST', body: JSON.stringify(logs) });
  }, []);

  // === Alert actions ===
  const addAlert = useCallback(async (alert) => {
    const newAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      time: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      read: false,
      timestamp: Date.now(),
      ...alert,
    };
    setAlerts(prev => [newAlert, ...prev]);
    api('alerts', { method: 'POST', body: JSON.stringify(newAlert) });
    return newAlert;
  }, []);

  const markAlertRead = useCallback(async (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    api('alerts', { method: 'PATCH', body: JSON.stringify({ id }) });
  }, []);

  const markAllAlertsRead = useCallback(async () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    api('alerts', { method: 'PATCH', body: JSON.stringify({ markAll: true }) });
  }, []);

  const deleteAlert = useCallback(async (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    api(`alerts?id=${id}`, { method: 'DELETE' });
  }, []);

  const clearAllAlerts = useCallback(async () => {
    setAlerts([]);
    api('alerts?id=all', { method: 'DELETE' });
  }, []);

  // === SOS ===
  const triggerSOS = useCallback((message) => {
    addAlert({
      type: 'sos',
      message: message || '🚨 SOS ALERT — Patient triggered emergency alert!',
      severity: 'danger',
      source: 'patient',
    });
    addActivity({ type: 'sos', message: '🚨 SOS Alert triggered by Rajan!', role: 'patient', icon: '🚨' });
  }, [addAlert, addActivity]);

  // === Vitals ===
  const updateVitals = useCallback(async (newVitals) => {
    setVitals(prev => ({ ...prev, ...newVitals }));
    api('vitals', { method: 'PATCH', body: JSON.stringify(newVitals) });
  }, []);

  // === Appointments ===
  const addAppointment = useCallback(async (apt) => {
    const newApt = {
      id: `apt_${Date.now()}`,
      status: 'scheduled',
      ...apt,
    };
    setAppointments(prev => [...prev, newApt]);
    addAlert({
      type: 'appointment',
      message: `New appointment scheduled: ${apt.doctor || apt.patient || 'Consultation'} on ${apt.date} at ${apt.time}`,
      severity: 'info',
      source: apt.source || 'system',
    });
    const who = apt.source === 'doctor' ? 'Dr. Priya' : apt.source === 'patient' ? 'Rajan' : 'System';
    addActivity({ type: 'appointment', message: `${who} scheduled an appointment for ${apt.date} at ${apt.time}`, role: apt.source || 'system', icon: '📅' });
    api('appointments', { method: 'POST', body: JSON.stringify(newApt) });
    return newApt;
  }, [addAlert, addActivity]);

  const cancelAppointment = useCallback(async (id) => {
    setAppointments(prev => {
      const apt = prev.find(a => a.id === id);
      if (apt) {
        addActivity({ type: 'appointment', message: `Appointment cancelled: ${apt.doctor || apt.patient || ''} on ${apt.date}`, role: 'system', icon: '❌' });
      }
      return prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a);
    });
    api('appointments', { method: 'PATCH', body: JSON.stringify({ id, status: 'cancelled' }) });
  }, [addActivity]);

  const rescheduleAppointment = useCallback(async (id, newDate, newTime) => {
    setAppointments(prev => {
      const apt = prev.find(a => a.id === id);
      if (apt) {
        addActivity({ type: 'appointment', message: `Appointment rescheduled: ${apt.doctor || apt.patient || ''} to ${newDate} at ${newTime}`, role: 'system', icon: '🔄' });
        addAlert({
          type: 'appointment',
          message: `Appointment rescheduled to ${newDate} at ${newTime}`,
          severity: 'info',
          source: 'system',
        });
      }
      return prev.map(a => a.id === id ? { ...a, date: newDate, time: newTime, status: 'scheduled' } : a);
    });
    api('appointments', { method: 'PATCH', body: JSON.stringify({ id, date: newDate, time: newTime, status: 'scheduled' }) });
  }, [addActivity, addAlert]);

  const completeAppointment = useCallback(async (id, outcome) => {
    setAppointments(prev => {
      const apt = prev.find(a => a.id === id);
      if (apt) {
        addActivity({ type: 'appointment', message: `Consultation completed: ${apt.doctor || apt.patient || ''}`, role: 'doctor', icon: '✅' });
      }
      return prev.map(a => a.id === id ? { ...a, status: 'completed', outcome: outcome || 'Consultation completed.' } : a);
    });
    api('appointments', { method: 'PATCH', body: JSON.stringify({ id, status: 'completed', outcome: outcome || 'Consultation completed.' }) });
  }, [addActivity]);

  // === Doctor Notes ===
  const addDoctorNote = useCallback(async (note) => {
    const newNote = {
      id: `note_${Date.now()}`,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-IN'),
      ...note,
    };
    setDoctorNotes(prev => [newNote, ...prev]);
    addActivity({ type: 'note', message: `Dr. Priya added a clinical note for Rajan`, role: 'doctor', icon: '📝' });
    api('doctor-notes', { method: 'POST', body: JSON.stringify(newNote) });
    return newNote;
  }, [addActivity]);

  // === Patient Location ===
  const updatePatientLocation = useCallback((location) => {
    setPatientLocation(location);
  }, []);

  // === Cross-Role Messaging ===
  const sendMessage = useCallback(async (msg) => {
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      read: false,
      ...msg,
    };
    setMessages(prev => [...prev, newMsg]);
    addActivity({ type: 'message', message: `${msg.fromName} sent a message to ${msg.toName}`, role: msg.from, icon: '💬' });
    api('messages', { method: 'POST', body: JSON.stringify(newMsg) });
    return newMsg;
  }, [addActivity]);

  const markMessageRead = useCallback(async (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    api('messages', { method: 'PATCH', body: JSON.stringify({ id }) });
  }, []);

  const markAllMessagesRead = useCallback(async (role) => {
    setMessages(prev => prev.map(m => m.to === role ? { ...m, read: true } : m));
    api('messages', { method: 'PATCH', body: JSON.stringify({ markAllForRole: role }) });
  }, []);

  // === Check-In actions ===
  const performCheckIn = useCallback(async () => {
    const todayKey = getTodayKey();
    const slot = getCurrentCheckinSlot();
    if (!slot) return { success: false, message: 'No check-in slot active right now (6 AM–11 PM)' };

    const alreadyDone = checkins.some(c => c.date === todayKey && c.slotId === slot.id);
    if (alreadyDone) return { success: false, message: `You already checked in for ${slot.label}` };

    const newCheckin = {
      id: `checkin_${Date.now()}`,
      date: todayKey,
      slotId: slot.id,
      slotLabel: slot.label,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    setCheckins(prev => [newCheckin, ...prev]);
    addActivity({
      type: 'checkin',
      message: `Rajan checked in — ${slot.label} check-in completed ✓`,
      role: 'patient',
      icon: '✅',
    });
    api('check-ins', { method: 'POST', body: JSON.stringify(newCheckin) });
    return { success: true, message: `${slot.label} check-in recorded!`, checkin: newCheckin };
  }, [checkins, addActivity]);

  const todayCheckins = checkins.filter(c => c.date === getTodayKey());
  const missedCheckins = getMissedSlots(checkins);

  // === Computed values ===
  const adherenceRate = medLogs.length > 0
    ? Math.round((medLogs.filter(l => l.status === 'taken').length / medLogs.length) * 100)
    : 0;

  const unreadAlertCount = alerts.filter(a => !a.read).length;

  const pendingMeds = medLogs.filter(l => l.status === 'pending').length;

  const getUnreadMessageCount = useCallback((role) => {
    return messages.filter(m => m.to === role && !m.read).length;
  }, [messages]);

  const getMessagesForRole = useCallback((role) => {
    return messages.filter(m => m.from === role || m.to === role).sort((a, b) => a.timestamp - b.timestamp);
  }, [messages]);

  const value = {
    // Data
    medications, medLogs, vitals, alerts, appointments, doctorNotes, patientLocation,
    messages, activityFeed, checkins,
    // Computed
    adherenceRate, unreadAlertCount, pendingMeds,
    todayCheckins, missedCheckins, checkinSchedule: CHECKIN_SCHEDULE,
    dbReady,
    // Medication actions
    takeMed, skipMed, addMedication, removeMedication, addMedLogs,
    // Alert actions
    addAlert, markAlertRead, markAllAlertsRead, deleteAlert, clearAllAlerts,
    // SOS
    triggerSOS,
    // Vitals
    updateVitals,
    // Appointments
    addAppointment, cancelAppointment, rescheduleAppointment, completeAppointment,
    // Doctor Notes
    addDoctorNote,
    // Location
    updatePatientLocation,
    // Messaging
    sendMessage, markMessageRead, markAllMessagesRead,
    getUnreadMessageCount, getMessagesForRole,
    // Check-in
    performCheckIn,
    // Activity
    addActivity,
  };

  return (
    <SharedDataContext.Provider value={value}>
      {children}
    </SharedDataContext.Provider>
  );
}

export function useSharedData() {
  const ctx = useContext(SharedDataContext);
  if (!ctx) throw new Error('useSharedData must be used within SharedDataProvider');
  return ctx;
}
