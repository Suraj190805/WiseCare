'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video, MapPin, Clock, Plus, ChevronLeft, ChevronRight, User, CheckCircle2, Phone, X, Trash2 } from 'lucide-react';
import { useToast } from '@/lib/Toast';
import Modal from '@/lib/Modal';

export default function DoctorAppointmentsPage() {
  const { addToast } = useToast();
  const [view, setView] = useState('upcoming');
  const [showSchedule, setShowSchedule] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [activeCallApt, setActiveCallApt] = useState(null);
  const [newApt, setNewApt] = useState({ patient: '', date: '', time: '', type: 'video', reason: '', notes: '' });

  const [appointments, setAppointments] = useState([
    { id: 1, patient: 'Rajan Kumar', age: 73, avatar: 'RK', type: 'video', date: 'Today', time: '3:00 PM', status: 'upcoming', reason: 'Monthly diabetes review', notes: 'Review blood sugar trends, adjust Metformin if needed' },
    { id: 2, patient: 'Mohan Lal', age: 79, avatar: 'ML', type: 'in-person', date: 'Apr 3', time: '10:00 AM', status: 'scheduled', reason: 'COPD follow-up', notes: 'Spirometry results pending, check oxygen levels' },
    { id: 3, patient: 'Rajan Kumar', age: 73, avatar: 'RK', type: 'video', date: 'Apr 5', time: '11:00 AM', status: 'scheduled', reason: 'Blood pressure follow-up', notes: 'Review home BP readings' },
    { id: 4, patient: 'Kamala Rao', age: 71, avatar: 'KR', type: 'in-person', date: 'Apr 8', time: '2:30 PM', status: 'scheduled', reason: 'Cardiac checkup', notes: 'ECG and echocardiogram review' },
    { id: 5, patient: 'Sunita Devi', age: 68, avatar: 'SD', type: 'video', date: 'Apr 10', time: '4:00 PM', status: 'scheduled', reason: 'Arthritis pain management', notes: 'Evaluate NSAID effectiveness' },
  ]);

  const [pastAppointments, setPastAppointments] = useState([
    { id: 6, patient: 'Rajan Kumar', avatar: 'RK', type: 'video', date: 'Mar 25', time: '3:00 PM', status: 'completed', reason: 'Diabetes review', outcome: 'Continued current medication. HbA1c improved to 7.2%.' },
    { id: 7, patient: 'Sunita Devi', avatar: 'SD', type: 'in-person', date: 'Mar 20', time: '11:00 AM', status: 'completed', reason: 'Hypertension review', outcome: 'Added Telmisartan 40mg. BP readings to be monitored.' },
    { id: 8, patient: 'Mohan Lal', avatar: 'ML', type: 'video', date: 'Mar 15', time: '10:00 AM', status: 'completed', reason: 'COPD assessment', outcome: 'Increased inhaler dosage. Ordered spirometry.' },
  ]);

  const displayedApts = view === 'upcoming' ? appointments : pastAppointments;

  const handleScheduleNew = () => {
    if (!newApt.patient || !newApt.date || !newApt.time) {
      addToast('Please fill in patient, date, and time', 'warning');
      return;
    }
    const apt = {
      id: Date.now(),
      patient: newApt.patient,
      avatar: newApt.patient.split(' ').map(w => w[0]).join(''),
      type: newApt.type,
      date: newApt.date,
      time: newApt.time,
      status: 'scheduled',
      reason: newApt.reason || 'General consultation',
      notes: newApt.notes || ''
    };
    setAppointments(prev => [...prev, apt]);
    setShowSchedule(false);
    setNewApt({ patient: '', date: '', time: '', type: 'video', reason: '', notes: '' });
    addToast(`✅ Appointment scheduled with ${apt.patient} on ${apt.date}`, 'success');
  };

  const handleCancelApt = (aptId) => {
    setAppointments(prev => prev.filter(a => a.id !== aptId));
    addToast('Appointment cancelled', 'warning');
  };

  const handleCompleteApt = (aptId) => {
    const apt = appointments.find(a => a.id === aptId);
    if (apt) {
      setAppointments(prev => prev.filter(a => a.id !== aptId));
      setPastAppointments(prev => [{ ...apt, status: 'completed', outcome: 'Consultation completed successfully.' }, ...prev]);
      addToast(`✅ Marked appointment with ${apt.patient} as completed`, 'success');
    }
  };

  const handleJoinVideo = (apt) => {
    setActiveCallApt(apt);
    setShowVideoCall(true);
    addToast(`📹 Joining video call with ${apt.patient}...`, 'info');
  };

  const endVideoCall = () => {
    const apt = activeCallApt;
    setShowVideoCall(false);
    setActiveCallApt(null);
    if (apt) {
      addToast(`📹 Video call with ${apt.patient} ended`, 'success');
    }
  };

  const patientOptions = ['Rajan Kumar', 'Sunita Devi', 'Mohan Lal', 'Kamala Rao'];

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
          <div className="stat-value">{appointments.length}</div>
          <div className="stat-label">Upcoming</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-icon primary"><Video size={22} /></div>
          <div className="stat-value">{appointments.filter(a => a.type === 'video').length}</div>
          <div className="stat-label">Video Calls</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="stat-value">{pastAppointments.length}</div>
          <div className="stat-label">Completed This Month</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Clock size={22} /></div>
          <div className="stat-value">{appointments.filter(a => a.date === 'Today').length}</div>
          <div className="stat-label">Today</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pill-tabs" style={{ marginBottom: '24px' }}>
        <button className={`pill-tab ${view === 'upcoming' ? 'active' : ''}`} onClick={() => setView('upcoming')}>Upcoming ({appointments.length})</button>
        <button className={`pill-tab ${view === 'past' ? 'active' : ''}`} onClick={() => setView('past')}>Past ({pastAppointments.length})</button>
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
                  {apt.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{apt.patient}</div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {apt.reason}
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
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {apt.status === 'upcoming' && apt.type === 'video' && (
                  <motion.button className="btn btn-primary btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleJoinVideo(apt)}>
                    <Video size={16} /> Join Now
                  </motion.button>
                )}
                {apt.status === 'upcoming' && (
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

          <div className="input-group">
            <label className="input-label">Notes (optional)</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Any preparation or pre-visit notes..."
              value={newApt.notes}
              onChange={(e) => setNewApt(prev => ({ ...prev, notes: e.target.value }))}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={handleScheduleNew} style={{ width: '100%' }}>
            <Calendar size={18} /> Schedule Appointment
          </motion.button>
        </div>
      </Modal>

      {/* Video Call Modal */}
      <Modal isOpen={showVideoCall} onClose={endVideoCall} title="Video Consultation" subtitle={activeCallApt ? `With ${activeCallApt.patient}` : ''} maxWidth="600px">
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
                {activeCallApt.avatar}
              </div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{activeCallApt.patient}</div>
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
