'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video, MapPin, Clock, Plus, ChevronLeft, ChevronRight, User, CheckCircle2, Phone, X, Trash2 } from 'lucide-react';
import { useSharedData } from '@/lib/SharedDataStore';
import { useToast } from '@/lib/Toast';
import Modal from '@/lib/Modal';

export default function DoctorAppointmentsPage() {
  const { addToast } = useToast();
  const { appointments, addAppointment, cancelAppointment, completeAppointment } = useSharedData();
  const [view, setView] = useState('upcoming');
  const [showSchedule, setShowSchedule] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [activeCallApt, setActiveCallApt] = useState(null);
  const [newApt, setNewApt] = useState({ patient: '', date: '', time: '', type: 'video', reason: '', notes: '' });

  // Split appointments into upcoming vs completed
  const upcomingApts = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
  const pastApts = appointments.filter(a => a.status === 'completed');

  const displayedApts = view === 'upcoming' ? upcomingApts : pastApts;

  const handleScheduleNew = () => {
    if (!newApt.patient || !newApt.date || !newApt.time) {
      addToast('Please fill in patient, date, and time', 'warning');
      return;
    }
    const formattedDate = new Date(newApt.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const formattedTime = new Date(`2000-01-01T${newApt.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    addAppointment({
      patient: newApt.patient,
      doctor: 'Dr. Priya Sharma',
      specialty: 'Cardiologist',
      type: newApt.type,
      date: formattedDate,
      time: formattedTime,
      reason: newApt.reason || 'General consultation',
      notes: newApt.notes || '',
      source: 'doctor',
    });
    setShowSchedule(false);
    setNewApt({ patient: '', date: '', time: '', type: 'video', reason: '', notes: '' });
    addToast(`✅ Appointment scheduled with ${newApt.patient}`, 'success');
  };

  const handleCancelApt = (aptId) => {
    cancelAppointment(aptId);
    addToast('Appointment cancelled', 'warning');
  };

  const handleCompleteApt = (aptId) => {
    completeAppointment(aptId, 'Consultation completed successfully.');
    addToast('✅ Appointment marked as completed', 'success');
  };

  const handleJoinVideo = (apt) => {
    setActiveCallApt(apt);
    setShowVideoCall(true);
    addToast(`📹 Joining video call with ${apt.patient || apt.doctor}...`, 'info');
  };

  const endVideoCall = () => {
    const apt = activeCallApt;
    setShowVideoCall(false);
    setActiveCallApt(null);
    if (apt) {
      addToast(`📹 Video call with ${apt.patient || apt.doctor} ended`, 'success');
    }
  };

  const patientOptions = ['Rajan Kumar', 'Sunita Devi', 'Mohan Lal', 'Kamala Rao'];

  const getAvatarInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Appointments</h1>
            <p className="page-description">Manage consultations and video calls</p>
          </div>
          <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={() => setShowSchedule(true)}>
            <Plus size={18} /> Schedule New
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card teal">
          <div className="stat-icon teal"><Calendar size={22} /></div>
          <div className="stat-value">{upcomingApts.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-icon primary"><Video size={22} /></div>
          <div className="stat-value">{upcomingApts.filter(a => a.type === 'video').length}</div>
          <div className="stat-label">Video Calls</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="stat-value">{pastApts.length}</div>
          <div className="stat-label">Completed This Month</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Clock size={22} /></div>
          <div className="stat-value">{upcomingApts.filter(a => a.date === 'Today' || a.status === 'upcoming').length}</div>
          <div className="stat-label">Today</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pill-tabs" style={{ marginBottom: '24px' }}>
        <button className={`pill-tab ${view === 'upcoming' ? 'active' : ''}`} onClick={() => setView('upcoming')}>Upcoming ({upcomingApts.length})</button>
        <button className={`pill-tab ${view === 'past' ? 'active' : ''}`} onClick={() => setView('past')}>Past ({pastApts.length})</button>
      </div>

      {/* Appointment List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {displayedApts.map((apt, i) => (
          <motion.div
            key={apt.id}
            className="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent-teal))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 700
                }}>
                  {getAvatarInitials(apt.patient || apt.doctor)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{apt.patient || apt.doctor}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {apt.reason || apt.specialty || 'Consultation'}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {apt.date}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {apt.time}
                    </span>
                    <span className={`badge ${apt.type === 'video' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                      {apt.type === 'video' ? '📹 Video' : '🏥 In-person'}
                    </span>
                    {apt.source && (
                      <span className="badge" style={{ fontSize: '0.6rem', background: apt.source === 'patient' ? 'rgba(45,212,191,0.1)' : 'rgba(79,107,255,0.1)', color: apt.source === 'patient' ? 'var(--accent-teal)' : 'var(--primary-soft)' }}>
                        {apt.source === 'patient' ? '🧑 Patient booked' : '👨‍⚕ Doctor scheduled'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {(apt.status === 'upcoming' || apt.status === 'scheduled') && apt.type === 'video' && (
                  <motion.button className="btn btn-primary btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleJoinVideo(apt)}>
                    <Video size={16} /> Join Now
                  </motion.button>
                )}
                {(apt.status === 'upcoming' || apt.status === 'scheduled') && (
                  <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleCompleteApt(apt.id)} style={{ color: 'var(--accent-emerald)' }}>
                    <CheckCircle2 size={16} /> Complete
                  </motion.button>
                )}
                {(apt.status === 'scheduled' || apt.status === 'upcoming') && (
                  <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleCancelApt(apt.id)} style={{ color: 'var(--accent-rose)' }}>
                    <Trash2 size={14} /> Cancel
                  </motion.button>
                )}
                {apt.status === 'completed' && (
                  <span className="badge badge-success">✓ Completed</span>
                )}
              </div>
            </div>

            {/* Notes */}
            {(apt.notes || apt.outcome) && (
              <div style={{
                marginTop: '14px', padding: '12px 16px',
                background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)',
                fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)'
              }}>
                {apt.outcome ? (
                  <><strong style={{ color: 'var(--text-primary)' }}>Outcome:</strong> {apt.outcome}</>
                ) : (
                  <><strong style={{ color: 'var(--text-primary)' }}>Notes:</strong> {apt.notes}</>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {displayedApts.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Calendar size={32} /></div>
          <h3>No {view} appointments</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {view === 'upcoming' ? 'Schedule a new appointment to get started' : 'No completed appointments yet'}
          </p>
        </div>
      )}

      {/* Schedule Modal */}
      <Modal isOpen={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule New Appointment" subtitle="Book a consultation with a patient">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="input-group">
            <label className="input-label">Patient</label>
            <select
              className="input"
              value={newApt.patient}
              onChange={(e) => setNewApt(prev => ({ ...prev, patient: e.target.value }))}
              style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            >
              <option value="">Select patient...</option>
              {patientOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input type="date" className="input" value={newApt.date} onChange={(e) => setNewApt(prev => ({ ...prev, date: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Time</label>
              <input type="time" className="input" value={newApt.time} onChange={(e) => setNewApt(prev => ({ ...prev, time: e.target.value }))} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Type</label>
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
            <label className="input-label">Reason</label>
            <input className="input" placeholder="e.g. Monthly diabetes review" value={newApt.reason} onChange={(e) => setNewApt(prev => ({ ...prev, reason: e.target.value }))} />
          </div>

          <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={handleScheduleNew} style={{ width: '100%' }}>
            <Calendar size={18} /> Schedule Appointment
          </motion.button>
        </div>
      </Modal>

      {/* Video Call Modal */}
      <Modal isOpen={showVideoCall} onClose={endVideoCall} title="Video Consultation" subtitle={activeCallApt ? `With ${activeCallApt.patient || activeCallApt.doctor}` : ''} maxWidth="600px">
        {activeCallApt && (
          <div>
            <div style={{
              height: '320px', background: 'linear-gradient(135deg, #0F172A, #1E293B)',
              borderRadius: 'var(--border-radius-sm)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', marginBottom: '20px', position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--accent-teal))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 700, marginBottom: '16px'
              }}>
                {getAvatarInitials(activeCallApt.patient || activeCallApt.doctor)}
              </div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{activeCallApt.patient || activeCallApt.doctor}</div>
              <div style={{ color: 'var(--accent-emerald)', fontSize: 'var(--font-size-sm)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', animation: 'sos-pulse 2s infinite' }} />
                Connected
              </div>
              <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '120px', height: '90px', background: 'rgba(79,107,255,0.15)', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                You
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <motion.button className="btn btn-danger" whileTap={{ scale: 0.95 }} onClick={() => { endVideoCall(); handleCompleteApt(activeCallApt.id); }}>
                <Phone size={18} /> End & Complete
              </motion.button>
              <motion.button className="btn btn-ghost" whileTap={{ scale: 0.95 }} onClick={endVideoCall}>
                End Call
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
