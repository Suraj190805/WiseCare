'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_MEDICATIONS, MOCK_MED_LOGS, MOCK_VITALS, MOCK_ALERTS, MOCK_APPOINTMENTS } from './mockData';

const SharedDataContext = createContext();

// localStorage keys
const KEYS = {
  MEDICATIONS: 'wisecare_medications',
  MED_LOGS: 'wisecare_med_logs',
  VITALS: 'wisecare_vitals',
  ALERTS: 'wisecare_shared_alerts',
  APPOINTMENTS: 'wisecare_appointments',
  DOCTOR_NOTES: 'wisecare_doctor_notes',
  PATIENT_LOCATION: 'wisecare_patient_location',
  MESSAGES: 'wisecare_messages',
  ACTIVITY_FEED: 'wisecare_activity_feed',
};

function load(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Default alerts with timestamps for cross-role sharing
const DEFAULT_ALERTS = MOCK_ALERTS.map(a => ({
  ...a,
  source: 'system',
  timestamp: Date.now() - Math.random() * 86400000,
}));

// Default activity feed entries
const DEFAULT_ACTIVITY = [
  { id: 'act_1', type: 'medication', message: 'Rajan took Metformin 500mg (morning dose)', role: 'patient', icon: '💊', timestamp: Date.now() - 3600000 },
  { id: 'act_2', type: 'vitals', message: 'Blood sugar reading recorded: 142 mg/dL', role: 'patient', icon: '🩸', timestamp: Date.now() - 7200000 },
  { id: 'act_3', type: 'appointment', message: 'Dr. Priya confirmed appointment for today at 3:00 PM', role: 'doctor', icon: '📅', timestamp: Date.now() - 10800000 },
  { id: 'act_4', type: 'note', message: 'Meera checked in on Rajan\'s medication status', role: 'caregiver', icon: '👁', timestamp: Date.now() - 14400000 },
];

// Default messages
const DEFAULT_MESSAGES = [
  { id: 'msg_1', from: 'doctor', fromName: 'Dr. Priya Sharma', to: 'caregiver', toName: 'Meera Kumar', text: 'Rajan\'s blood sugar is trending down nicely. Continue monitoring.', timestamp: Date.now() - 7200000, read: true },
  { id: 'msg_2', from: 'caregiver', fromName: 'Meera Kumar', to: 'doctor', toName: 'Dr. Priya Sharma', text: 'He\'s been following the diet plan well this week. Will keep an eye on evening doses.', timestamp: Date.now() - 3600000, read: true },
  { id: 'msg_3', from: 'doctor', fromName: 'Dr. Priya Sharma', to: 'patient', toName: 'Rajan Kumar', text: 'Good job on your morning walks, Rajan! Keep it up 👍', timestamp: Date.now() - 1800000, read: false },
];

export function SharedDataProvider({ children }) {
  const [medications, setMedications] = useState(() => load(KEYS.MEDICATIONS, [...MOCK_MEDICATIONS]));
  const [medLogs, setMedLogs] = useState(() => load(KEYS.MED_LOGS, [...MOCK_MED_LOGS]));
  const [vitals, setVitals] = useState(() => load(KEYS.VITALS, { ...MOCK_VITALS }));
  const [alerts, setAlerts] = useState(() => load(KEYS.ALERTS, DEFAULT_ALERTS));
  const [appointments, setAppointments] = useState(() => load(KEYS.APPOINTMENTS, [...MOCK_APPOINTMENTS]));
  const [doctorNotes, setDoctorNotes] = useState(() => load(KEYS.DOCTOR_NOTES, []));
  const [patientLocation, setPatientLocation] = useState(() => load(KEYS.PATIENT_LOCATION, null));
  const [messages, setMessages] = useState(() => load(KEYS.MESSAGES, DEFAULT_MESSAGES));
  const [activityFeed, setActivityFeed] = useState(() => load(KEYS.ACTIVITY_FEED, DEFAULT_ACTIVITY));

  // Persist to localStorage
  useEffect(() => { save(KEYS.MEDICATIONS, medications); }, [medications]);
  useEffect(() => { save(KEYS.MED_LOGS, medLogs); }, [medLogs]);
  useEffect(() => { save(KEYS.VITALS, vitals); }, [vitals]);
  useEffect(() => { save(KEYS.ALERTS, alerts); }, [alerts]);
  useEffect(() => { save(KEYS.APPOINTMENTS, appointments); }, [appointments]);
  useEffect(() => { save(KEYS.DOCTOR_NOTES, doctorNotes); }, [doctorNotes]);
  useEffect(() => { save(KEYS.PATIENT_LOCATION, patientLocation); }, [patientLocation]);
  useEffect(() => { save(KEYS.MESSAGES, messages); }, [messages]);
  useEffect(() => { save(KEYS.ACTIVITY_FEED, activityFeed); }, [activityFeed]);

  // Cross-tab sync via storage events
  useEffect(() => {
    const handler = (e) => {
      try {
        if (e.key === KEYS.MEDICATIONS && e.newValue) setMedications(JSON.parse(e.newValue));
        if (e.key === KEYS.MED_LOGS && e.newValue) setMedLogs(JSON.parse(e.newValue));
        if (e.key === KEYS.VITALS && e.newValue) setVitals(JSON.parse(e.newValue));
        if (e.key === KEYS.ALERTS && e.newValue) setAlerts(JSON.parse(e.newValue));
        if (e.key === KEYS.APPOINTMENTS && e.newValue) setAppointments(JSON.parse(e.newValue));
        if (e.key === KEYS.DOCTOR_NOTES && e.newValue) setDoctorNotes(JSON.parse(e.newValue));
        if (e.key === KEYS.PATIENT_LOCATION && e.newValue) setPatientLocation(JSON.parse(e.newValue));
        if (e.key === KEYS.MESSAGES && e.newValue) setMessages(JSON.parse(e.newValue));
        if (e.key === KEYS.ACTIVITY_FEED && e.newValue) setActivityFeed(JSON.parse(e.newValue));
      } catch {}
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // === Activity Feed ===
  const addActivity = useCallback((entry) => {
    const newEntry = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      ...entry,
    };
    setActivityFeed(prev => [newEntry, ...prev].slice(0, 50)); // keep last 50
    return newEntry;
  }, []);

  // === Medication actions ===
  const takeMed = useCallback((logId) => {
    setMedLogs(prev => {
      const log = prev.find(l => l.id === logId);
      if (log) {
        // We need meds from state — use functional access
        const currentMeds = load(KEYS.MEDICATIONS, []);
        const med = currentMeds.find(m => m.id === log.medId);
        if (med) {
          addActivity({ type: 'medication', message: `Rajan took ${med.name} ${med.dosage} (${log.time} dose)`, role: 'patient', icon: '💊' });
        }
      }
      return prev.map(l => l.id === logId ? { ...l, status: 'taken' } : l);
    });
  }, [addActivity]);

  const skipMed = useCallback((logId) => {
    setMedLogs(prev => {
      const updated = prev.map(l => l.id === logId ? { ...l, status: 'skipped' } : l);
      const log = prev.find(l => l.id === logId);
      if (log) {
        const currentMeds = load(KEYS.MEDICATIONS, []);
        const med = currentMeds.find(m => m.id === log.medId);
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
      return updated;
    });
  }, []);

  const addMedication = useCallback((med) => {
    setMedications(prev => [...prev, med]);
    addActivity({ type: 'medication', message: `New medication added: ${med.name} ${med.dosage}`, role: med.prescribedBy === 'doctor' ? 'doctor' : 'patient', icon: '💊' });
  }, [addActivity]);

  const removeMedication = useCallback((medId) => {
    setMedications(prev => {
      const med = prev.find(m => m.id === medId);
      if (med) {
        addActivity({ type: 'medication', message: `Medication discontinued: ${med.name} ${med.dosage}`, role: 'doctor', icon: '🚫' });
      }
      return prev.filter(m => m.id !== medId);
    });
    setMedLogs(prev => prev.filter(l => l.medId !== medId));
  }, [addActivity]);

  const addMedLogs = useCallback((logs) => {
    setMedLogs(prev => [...prev, ...logs]);
  }, []);

  // === Alert actions ===
  const addAlert = useCallback((alert) => {
    const newAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      time: new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      read: false,
      timestamp: Date.now(),
      ...alert,
    };
    setAlerts(prev => [newAlert, ...prev]);
    return newAlert;
  }, []);

  const markAlertRead = useCallback((id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  const markAllAlertsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  const deleteAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
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
  const updateVitals = useCallback((newVitals) => {
    setVitals(prev => ({ ...prev, ...newVitals }));
  }, []);

  // === Appointments ===
  const addAppointment = useCallback((apt) => {
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
    return newApt;
  }, [addAlert, addActivity]);

  const cancelAppointment = useCallback((id) => {
    setAppointments(prev => {
      const apt = prev.find(a => a.id === id);
      if (apt) {
        addActivity({ type: 'appointment', message: `Appointment cancelled: ${apt.doctor || apt.patient || ''} on ${apt.date}`, role: 'system', icon: '❌' });
      }
      return prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a);
    });
  }, [addActivity]);

  const rescheduleAppointment = useCallback((id, newDate, newTime) => {
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
  }, [addActivity, addAlert]);

  const completeAppointment = useCallback((id, outcome) => {
    setAppointments(prev => {
      const apt = prev.find(a => a.id === id);
      if (apt) {
        addActivity({ type: 'appointment', message: `Consultation completed: ${apt.doctor || apt.patient || ''}`, role: 'doctor', icon: '✅' });
      }
      return prev.map(a => a.id === id ? { ...a, status: 'completed', outcome: outcome || 'Consultation completed.' } : a);
    });
  }, [addActivity]);

  // === Doctor Notes ===
  const addDoctorNote = useCallback((note) => {
    const newNote = {
      id: `note_${Date.now()}`,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-IN'),
      ...note,
    };
    setDoctorNotes(prev => [newNote, ...prev]);
    addActivity({ type: 'note', message: `Dr. Priya added a clinical note for Rajan`, role: 'doctor', icon: '📝' });
    return newNote;
  }, [addActivity]);

  // === Patient Location ===
  const updatePatientLocation = useCallback((location) => {
    setPatientLocation(location);
  }, []);

  // === Cross-Role Messaging ===
  const sendMessage = useCallback((msg) => {
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      read: false,
      ...msg,
    };
    setMessages(prev => [...prev, newMsg]);
    addActivity({ type: 'message', message: `${msg.fromName} sent a message to ${msg.toName}`, role: msg.from, icon: '💬' });
    return newMsg;
  }, [addActivity]);

  const markMessageRead = useCallback((id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  }, []);

  const markAllMessagesRead = useCallback((role) => {
    setMessages(prev => prev.map(m => m.to === role ? { ...m, read: true } : m));
  }, []);

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
    messages, activityFeed,
    // Computed
    adherenceRate, unreadAlertCount, pendingMeds,
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
