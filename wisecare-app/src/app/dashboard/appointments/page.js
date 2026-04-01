'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Video, MapPin, Clock, User, Phone, PhoneOff,
  Plus, ChevronRight, FileText, CheckCircle2, Mic, MicOff,
  VideoOff, MessageSquare, X, Trash2, Maximize2, Minimize2
} from 'lucide-react';
import { MOCK_APPOINTMENTS } from '@/lib/mockData';
import { useToast } from '@/lib/Toast';
import Modal from '@/lib/Modal';

const STORAGE_KEY = 'wisecare_patient_appointments';

function loadAppointments() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

function saveAppointments(upcoming, past) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ upcoming, past }));
  } catch {}
}

const DOCTORS = [
  { name: 'Dr. Priya Sharma', specialty: 'Cardiologist' },
  { name: 'Dr. Rajesh Iyer', specialty: 'Endocrinologist' },
  { name: 'Dr. Anita Verma', specialty: 'General Physician' },
  { name: 'Dr. Suresh Kumar', specialty: 'Pulmonologist' },
];

export default function AppointmentsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('upcoming');

  // Modals
  const [showBooking, setShowBooking] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [activeCallApt, setActiveCallApt] = useState(null);
  const [rescheduleApt, setRescheduleApt] = useState(null);

  // Form state
  const [newApt, setNewApt] = useState({ doctor: '', date: '', time: '', type: 'video', reason: '' });
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  // Video call state
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Appointments state
  const defaultUpcoming = MOCK_APPOINTMENTS.map(apt => ({
    ...apt,
    reason: apt.id === 'apt_1' ? 'Monthly diabetes review' : apt.id === 'apt_2' ? 'Blood sugar follow-up' : 'BP check & medication review',
  }));

  const defaultPast = [
    { id: 'past_1', doctor: 'Dr. Priya Sharma', specialty: 'Cardiologist', date: 'Mar 25', time: '2:00 PM', type: 'video', status: 'completed', reason: 'Routine checkup', notes: 'BP stable, continue current medication. Follow-up in 2 weeks.' },
    { id: 'past_2', doctor: 'Dr. Rajesh Iyer', specialty: 'Endocrinologist', date: 'Mar 15', time: '10:30 AM', type: 'in-person', status: 'completed', reason: 'Diabetes review', notes: 'HbA1c at 7.2%, improving. Maintain diet plan.' },
  ];

  const [appointments, setAppointments] = useState(defaultUpcoming);
  const [pastAppointments, setPastAppointments] = useState(defaultPast);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const stored = loadAppointments();
    if (stored) {
      setAppointments(stored.upcoming);
      setPastAppointments(stored.past);
    }
    setHydrated(true);
  }, []);

  // Persist (only after hydration to avoid overwriting with defaults)
  useEffect(() => { if (hydrated) saveAppointments(appointments, pastAppointments); }, [appointments, pastAppointments, hydrated]);

  // Call timer
  useEffect(() => {
    let timer;
    if (showVideoCall) {
      timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [showVideoCall]);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ── Handlers ──

  const handleBookAppointment = () => {
    if (!newApt.doctor || !newApt.date || !newApt.time) {
      addToast('Please fill in doctor, date, and time', 'warning');
      return;
    }
    const doctor = DOCTORS.find(d => d.name === newApt.doctor);
    const apt = {
      id: `apt_${Date.now()}`,
      doctor: newApt.doctor,
      specialty: doctor?.specialty || 'Specialist',
      date: new Date(newApt.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      time: new Date(`2000-01-01T${newApt.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      type: newApt.type,
      status: 'scheduled',
      reason: newApt.reason || 'General consultation',
    };
    setAppointments(prev => [...prev, apt]);
    setShowBooking(false);
    setNewApt({ doctor: '', date: '', time: '', type: 'video', reason: '' });
    addToast(`✅ Appointment booked with ${apt.doctor} on ${apt.date}`, 'success');
  };

  const handleCancel = (aptId) => {
    const apt = appointments.find(a => a.id === aptId);
    setAppointments(prev => prev.filter(a => a.id !== aptId));
    addToast(`Appointment with ${apt?.doctor} cancelled`, 'warning');
  };

  const handleRescheduleOpen = (apt) => {
    setRescheduleApt(apt);
    setRescheduleData({ date: '', time: '' });
    setShowReschedule(true);
  };

  const handleRescheduleConfirm = () => {
    if (!rescheduleData.date || !rescheduleData.time) {
      addToast('Please select new date and time', 'warning');
      return;
    }
    setAppointments(prev => prev.map(a => {
      if (a.id === rescheduleApt.id) {
        return {
          ...a,
          date: new Date(rescheduleData.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          time: new Date(`2000-01-01T${rescheduleData.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          status: 'scheduled',
        };
      }
      return a;
    }));
    setShowReschedule(false);
    addToast(`✅ Appointment rescheduled with ${rescheduleApt.doctor}`, 'success');
  };

  const handleJoinVideo = (apt) => {
    setActiveCallApt(apt);
    setShowVideoCall(true);
    setIsMuted(false);
    setIsVideoOn(true);
    addToast(`📹 Connecting to video call with ${apt.doctor}...`, 'info');
  };

  const handleEndCall = (markComplete = false) => {
    const apt = activeCallApt;
    setShowVideoCall(false);
    setActiveCallApt(null);
    if (apt && markComplete) {
      setAppointments(prev => prev.filter(a => a.id !== apt.id));
      setPastAppointments(prev => [{
        ...apt,
        status: 'completed',
        notes: `Video consultation completed. Duration: ${formatDuration(callDuration)}. Follow-up recommendations pending.`,
      }, ...prev]);
      addToast(`✅ Consultation with ${apt.doctor} completed`, 'success');
    } else if (apt) {
      addToast(`📹 Call with ${apt.doctor} ended`, 'info');
    }
  };

  const displayedApts = activeTab === 'upcoming' ? appointments : pastAppointments;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Appointments</h1>
            <p className="page-description">Schedule and manage your doctor consultations</p>
          </div>
          <motion.button
            className="btn btn-primary"
            onClick={() => setShowBooking(true)}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} /> Book Appointment
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card primary">
          <div className="stat-icon primary"><Calendar size={22} /></div>
          <div className="stat-value">{appointments.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon teal"><Video size={22} /></div>
          <div className="stat-value">{appointments.filter(a => a.type === 'video').length}</div>
          <div className="stat-label">Video Calls</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="stat-value">{pastAppointments.length}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Clock size={22} /></div>
          <div className="stat-value">{appointments.filter(a => a.status === 'upcoming').length}</div>
          <div className="stat-label">Today</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pill-tabs" style={{ marginBottom: '24px' }}>
        <button className={`pill-tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
          Upcoming ({appointments.length})
        </button>
        <button className={`pill-tab ${activeTab === 'past' ? 'active' : ''}`} onClick={() => setActiveTab('past')}>
          Past ({pastAppointments.length})
        </button>
      </div>

      {/* Appointment List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {displayedApts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
              <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>No {activeTab} appointments</h3>
              <p style={{ fontSize: 'var(--font-size-sm)' }}>
                {activeTab === 'upcoming' ? 'Book a new appointment to get started' : 'No completed appointments yet'}
              </p>
            </div>
          )}

          {displayedApts.map((apt, i) => (
            <motion.div
              key={apt.id}
              className="card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={apt.status === 'completed' ? { opacity: 0.85 } : {}}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '14px' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: apt.type === 'video' ? 'var(--accent-purple-soft)' : 'var(--accent-teal-soft)',
                    color: apt.type === 'video' ? 'var(--accent-purple)' : 'var(--accent-teal)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {apt.type === 'video' ? <Video size={24} /> : <MapPin size={24} />}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 600 }}>{apt.doctor}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{apt.specialty}</p>
                    {apt.reason && (
                      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: '2px' }}>{apt.reason}</p>
                    )}
                  </div>
                </div>
                <span className={`badge ${apt.status === 'upcoming' ? 'badge-success' : apt.status === 'completed' ? 'badge-info' : 'badge-warning'}`}>
                  {apt.status === 'upcoming' ? '🔴 Today' : apt.status === 'completed' ? '✓ Completed' : '📅 Scheduled'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  <Calendar size={14} /> {apt.date}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  <Clock size={14} /> {apt.time}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                  {apt.type === 'video' ? <Video size={14} /> : <MapPin size={14} />}
                  {apt.type === 'video' ? 'Video Call' : 'In-Person'}
                </div>
              </div>

              {/* Notes for completed appointments */}
              {apt.notes && (
                <div style={{
                  padding: '12px 16px', background: 'var(--bg-elevated)',
                  borderRadius: 'var(--border-radius-sm)', borderLeft: '3px solid var(--accent-teal)',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <FileText size={14} style={{ color: 'var(--accent-teal)' }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Doctor's Notes</span>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{apt.notes}</p>
                </div>
              )}

              {/* Action buttons */}
              {apt.status !== 'completed' && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {apt.type === 'video' && (apt.status === 'upcoming' || apt.status === 'scheduled') && (
                    <motion.button className="btn btn-primary btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleJoinVideo(apt)}>
                      <Video size={16} /> Join Video Call
                    </motion.button>
                  )}
                  <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleRescheduleOpen(apt)}>
                    Reschedule
                  </motion.button>
                  <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleCancel(apt.id)} style={{ color: 'var(--accent-rose)' }}>
                    <Trash2 size={14} /> Cancel
                  </motion.button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Pre-Call Health Summary */}
      {activeTab === 'upcoming' && appointments.some(a => a.type === 'video') && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: '24px', background: 'rgba(79, 107, 255, 0.05)', borderColor: 'rgba(79, 107, 255, 0.2)' }}
        >
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <FileText size={20} style={{ color: 'var(--primary-soft)', flexShrink: 0 }} />
            <div>
              <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Pre-Call Health Summary</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Auto-generated for your next appointment
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Avg Heart Rate (7d)', value: '72 bpm' },
              { label: 'Avg Blood Pressure (7d)', value: '128/82 mmHg' },
              { label: 'Blood Sugar (latest)', value: '142 mg/dL' },
              { label: 'Med Adherence (7d)', value: '87%' },
              { label: 'Active Conditions', value: 'Type 2 Diabetes, Hypertension' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Book Appointment Modal ── */}
      <Modal isOpen={showBooking} onClose={() => setShowBooking(false)} title="Book New Appointment" subtitle="Schedule a consultation with your doctor">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="input-group">
            <label className="input-label">Doctor</label>
            <select
              className="input"
              value={newApt.doctor}
              onChange={e => setNewApt(prev => ({ ...prev, doctor: e.target.value }))}
              style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            >
              <option value="">Select doctor...</option>
              {DOCTORS.map(d => (
                <option key={d.name} value={d.name}>{d.name} — {d.specialty}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input type="date" className="input" value={newApt.date} onChange={e => setNewApt(prev => ({ ...prev, date: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Time</label>
              <input type="time" className="input" value={newApt.time} onChange={e => setNewApt(prev => ({ ...prev, time: e.target.value }))} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Consultation Type</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['video', 'in-person'].map(t => (
                <motion.button
                  key={t}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNewApt(prev => ({ ...prev, type: t }))}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 'var(--border-radius-sm)',
                    border: `2px solid ${newApt.type === t ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    background: newApt.type === t ? 'var(--primary-glow)' : 'var(--bg-elevated)',
                    color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'center',
                    fontWeight: 600, fontSize: 'var(--font-size-sm)'
                  }}
                >
                  {t === 'video' ? '📹 Video Call' : '🏥 In-Person'}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Reason (optional)</label>
            <input className="input" placeholder="e.g. Blood pressure follow-up" value={newApt.reason} onChange={e => setNewApt(prev => ({ ...prev, reason: e.target.value }))} />
          </div>

          <motion.button
            className="btn btn-primary"
            whileTap={{ scale: 0.97 }}
            onClick={handleBookAppointment}
            style={{ width: '100%' }}
            disabled={!newApt.doctor || !newApt.date || !newApt.time}
          >
            <Calendar size={18} /> Book Appointment
          </motion.button>
        </div>
      </Modal>

      {/* ── Reschedule Modal ── */}
      <Modal isOpen={showReschedule} onClose={() => setShowReschedule(false)} title="Reschedule Appointment" subtitle={rescheduleApt ? `With ${rescheduleApt.doctor}` : ''}>
        {rescheduleApt && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Date</span>
                <span style={{ fontWeight: 600 }}>{rescheduleApt.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Time</span>
                <span style={{ fontWeight: 600 }}>{rescheduleApt.time}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">New Date</label>
                <input type="date" className="input" value={rescheduleData.date} onChange={e => setRescheduleData(prev => ({ ...prev, date: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">New Time</label>
                <input type="time" className="input" value={rescheduleData.time} onChange={e => setRescheduleData(prev => ({ ...prev, time: e.target.value }))} />
              </div>
            </div>

            <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={handleRescheduleConfirm} style={{ width: '100%' }}>
              <Calendar size={18} /> Confirm Reschedule
            </motion.button>
          </div>
        )}
      </Modal>

      {/* ── Video Call Overlay (custom, not Modal) ── */}
      <AnimatePresence>
        {showVideoCall && activeCallApt && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(8px)', zIndex: 600
              }}
              onClick={() => !isFullscreen && handleEndCall(false)}
            />

            {/* Video Call Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'fixed',
                inset: isFullscreen ? 0 : undefined,
                top: isFullscreen ? 0 : '50%',
                left: isFullscreen ? 0 : '50%',
                transform: isFullscreen ? 'none' : 'translate(-50%, -50%)',
                width: isFullscreen ? '100vw' : 'min(700px, calc(100vw - 40px))',
                height: isFullscreen ? '100vh' : 'auto',
                maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 60px)',
                background: isFullscreen ? '#0B1120' : 'rgba(17, 24, 39, 0.98)',
                border: isFullscreen ? 'none' : '1px solid var(--border-default)',
                borderRadius: isFullscreen ? 0 : 'var(--border-radius-lg)',
                boxShadow: isFullscreen ? 'none' : '0 24px 80px rgba(0,0,0,0.6)',
                zIndex: 601,
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Header bar */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: isFullscreen ? '16px 24px' : '20px 28px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                flexShrink: 0,
              }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>Video Consultation</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>With {activeCallApt.doctor}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                      borderRadius: '50%', width: '36px', height: '36px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--text-secondary)'
                    }}
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </motion.button>
                  <button
                    onClick={() => handleEndCall(false)}
                    style={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                      borderRadius: '50%', width: '36px', height: '36px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'var(--text-secondary)'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Video Feed */}
              <div style={{
                flex: 1, minHeight: isFullscreen ? 0 : '360px',
                background: 'linear-gradient(135deg, #0F172A, #1E293B)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
                margin: isFullscreen ? 0 : '0',
              }}>
                {/* Grid overlay */}
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.04,
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                  backgroundSize: '30px 30px'
                }} />

                {/* Doctor avatar */}
                <div style={{
                  width: isFullscreen ? '120px' : '90px',
                  height: isFullscreen ? '120px' : '90px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent-teal))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isFullscreen ? '2.5rem' : '2rem', fontWeight: 700, marginBottom: '16px',
                  boxShadow: '0 0 40px rgba(79, 107, 255, 0.3)'
                }}>
                  {activeCallApt.doctor.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div style={{ fontWeight: 700, fontSize: isFullscreen ? 'var(--font-size-2xl)' : 'var(--font-size-lg)' }}>{activeCallApt.doctor}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>{activeCallApt.specialty}</div>
                <div style={{
                  color: 'var(--accent-emerald)', fontSize: 'var(--font-size-sm)', marginTop: '12px',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'var(--accent-emerald)',
                    animation: 'sos-pulse 2s infinite'
                  }} />
                  Connected • {formatDuration(callDuration)}
                </div>

                {/* Self-view (mini) */}
                <div style={{
                  position: 'absolute', bottom: '20px', right: '20px',
                  width: isFullscreen ? '180px' : '120px',
                  height: isFullscreen ? '135px' : '90px',
                  background: isVideoOn ? 'rgba(79,107,255,0.15)' : 'rgba(0,0,0,0.6)',
                  borderRadius: '14px', border: '2px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isFullscreen ? '1rem' : '0.8rem', fontWeight: 700,
                  backdropFilter: 'blur(10px)',
                }}>
                  {isVideoOn ? <span>You</span> : <VideoOff size={20} style={{ color: 'var(--text-muted)' }} />}
                </div>

                {/* REC badge */}
                <div style={{
                  position: 'absolute', top: '16px', left: '16px',
                  padding: '6px 14px', background: 'rgba(0,0,0,0.5)',
                  borderRadius: '20px', fontSize: 'var(--font-size-xs)',
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f43f5e', animation: 'sos-pulse 1s infinite' }} />
                  REC • {formatDuration(callDuration)}
                </div>
              </div>

              {/* Call Controls bar */}
              <div style={{
                padding: isFullscreen ? '20px 24px' : '16px 28px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center',
                flexShrink: 0,
                background: isFullscreen ? 'rgba(0,0,0,0.4)' : 'transparent',
              }}>
                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsMuted(!isMuted)}
                    style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: isMuted ? 'var(--accent-rose)' : 'var(--bg-elevated)',
                      border: `1px solid ${isMuted ? 'var(--accent-rose)' : 'var(--border-subtle)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: isMuted ? '#fff' : 'var(--text-primary)'
                    }}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: !isVideoOn ? 'var(--accent-rose)' : 'var(--bg-elevated)',
                      border: `1px solid ${!isVideoOn ? 'var(--accent-rose)' : 'var(--border-subtle)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: !isVideoOn ? '#fff' : 'var(--text-primary)'
                    }}
                    title={isVideoOn ? 'Turn off video' : 'Turn on video'}
                  >
                    {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: isFullscreen ? 'var(--primary)' : 'var(--bg-elevated)',
                      border: `1px solid ${isFullscreen ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: isFullscreen ? '#fff' : 'var(--text-primary)'
                    }}
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEndCall(false)}
                    style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: '#f43f5e',
                      border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff'
                    }}
                    title="End call"
                  >
                    <PhoneOff size={20} />
                  </motion.button>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <motion.button className="btn btn-primary btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleEndCall(true)}>
                    <CheckCircle2 size={16} /> End & Mark Complete
                  </motion.button>
                  <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleEndCall(false)}>
                    End Call
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
