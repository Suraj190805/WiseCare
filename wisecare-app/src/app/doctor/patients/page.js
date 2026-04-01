'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  User, Heart, Activity, Pill, FileText, Phone,
  Video, ChevronRight, Search, Eye, X, Calendar,
  TrendingUp, TrendingDown, Minus, MapPin, Clock,
  AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useSharedData } from '@/lib/SharedDataStore';
import { useToast } from '@/lib/Toast';
import Modal from '@/lib/Modal';

export default function DoctorPatientsPageWrapper() {
  return (
    <Suspense fallback={<div className="fade-in" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading patients...</div>}>
      <DoctorPatientsPage />
    </Suspense>
  );
}

function DoctorPatientsPage() {
  const { addToast } = useToast();
  const { vitals, medications, medLogs, adherenceRate, doctorNotes, addDoctorNote, addAlert } = useSharedData();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [videoCallPatient, setVideoCallPatient] = useState(null);
  const [callTimer, setCallTimer] = useState(0);
  const [noteText, setNoteText] = useState('');

  // Build patient list — Rajan uses LIVE shared data, others are static
  const patients = [
    { id: 'p1', name: 'Rajan Kumar', age: 73, gender: 'Male', conditions: ['Type 2 Diabetes', 'Hypertension'], risk: 'moderate', adherence: adherenceRate, avatar: 'RK', phone: '+91 98765 43210', lastVisit: 'Mar 25, 2026', nextVisit: 'Apr 1, 2026', bp: vitals.bloodPressure?.current || '128/82', hr: vitals.heartRate?.current || 72, sugar: vitals.bloodSugar?.current || 142, spo2: vitals.spo2?.current || 97, weight: `${vitals.weight?.current || 72} kg`, medications: medications.map(m => `${m.name} ${m.dosage}`), notes: doctorNotes.length > 0 ? doctorNotes[0].text : 'Blood sugar trending down. Continue current medications. HbA1c improved to 7.2%.', isLive: true },
    { id: 'p2', name: 'Sunita Devi', age: 68, gender: 'Female', conditions: ['Hypertension', 'Arthritis'], risk: 'low', adherence: 92, avatar: 'SD', phone: '+91 98765 55555', lastVisit: 'Mar 20, 2026', nextVisit: 'Apr 8, 2026', bp: '135/85', hr: 78, sugar: 105, spo2: 98, weight: '65 kg', medications: ['Telmisartan 40mg', 'Diclofenac 50mg'], notes: 'BP slightly elevated. Added Telmisartan. Arthritis managed with NSAIDs.' },
    { id: 'p3', name: 'Mohan Lal', age: 79, gender: 'Male', conditions: ['COPD', 'Diabetes'], risk: 'high', adherence: 65, avatar: 'ML', phone: '+91 98765 66666', lastVisit: 'Mar 28, 2026', nextVisit: 'Apr 3, 2026', bp: '145/92', hr: 85, sugar: 188, spo2: 93, weight: '68 kg', medications: ['Salbutamol Inhaler', 'Metformin 1000mg', 'Tiotropium'], notes: 'COPD worsening. Low medication adherence is concerning. SpO2 needs monitoring.' },
    { id: 'p4', name: 'Kamala Rao', age: 71, gender: 'Female', conditions: ['Heart Disease'], risk: 'moderate', adherence: 78, avatar: 'KR', phone: '+91 98765 77777', lastVisit: 'Mar 22, 2026', nextVisit: 'Apr 10, 2026', bp: '140/88', hr: 74, sugar: 118, spo2: 96, weight: '58 kg', medications: ['Digoxin 0.25mg', 'Amiodarone 200mg', 'Warfarin 5mg'], notes: 'Ejection fraction stable at 55%. Drug interaction flag for Digoxin + Amiodarone.' },
  ];

  const riskColor = (risk) => risk === 'high' ? 'var(--accent-rose)' : risk === 'moderate' ? 'var(--accent-amber)' : 'var(--accent-emerald)';

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleCall = (patient) => {
    setCallActive(true);
    addToast(`📞 Calling ${patient.name} at ${patient.phone}...`, 'info');
    let t = 0;
    const timer = setInterval(() => {
      t++;
      setCallTimer(t);
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      setCallActive(false);
      setCallTimer(0);
      addToast(`✅ Call with ${patient.name} completed (${t}s)`, 'success');
    }, 5000);
  };

  const handleVideoCall = (patient) => {
    setVideoCallPatient(patient);
    setShowVideoCall(true);
    addToast(`📹 Starting video call with ${patient.name}...`, 'info');
  };

  const endVideoCall = () => {
    setShowVideoCall(false);
    addToast(`📹 Video call with ${videoCallPatient?.name} ended`, 'success');
    setVideoCallPatient(null);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">My Patients</h1>
        <p className="page-description">Manage and monitor all assigned patients</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px',
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--border-radius)', maxWidth: '400px'
        }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search patients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-primary)',
              fontSize: 'var(--font-size-sm)', outline: 'none', width: '100%'
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={16} />
            </button>
          )}
        </div>
        {search && <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>Showing {filtered.length} of {patients.length} patients</p>}
      </div>

      {/* Patient Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            className="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              {/* Patient info */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${riskColor(p.risk)}, var(--primary))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 700
                }}>
                  {p.avatar}
                </div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{p.name}</h3>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {p.gender}, Age {p.age} • {p.conditions.join(', ')}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span className="badge" style={{ background: `${riskColor(p.risk)}18`, color: riskColor(p.risk) }}>
                      {p.risk} risk
                    </span>
                    <span className="badge badge-info">Adherence: {p.adherence}%</span>
                    {p.isLive && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>🟢 LIVE DATA</span>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <motion.button
                  className="btn btn-ghost btn-sm"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPatient(p)}
                >
                  <Eye size={16} /> View Details
                </motion.button>
                <motion.button
                  className="btn btn-ghost btn-sm"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCall(p)}
                  disabled={callActive}
                >
                  <Phone size={16} /> {callActive ? `Calling... ${callTimer}s` : 'Call'}
                </motion.button>
                <motion.button
                  className="btn btn-primary btn-sm"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVideoCall(p)}
                >
                  <Video size={16} /> Video Call
                </motion.button>
              </div>
            </div>

            {/* Vitals Quick View */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '16px' }}>
              {[
                { label: 'Blood Pressure', value: p.bp, unit: 'mmHg', color: parseInt(p.bp) > 140 ? 'var(--accent-rose)' : 'var(--accent-teal)' },
                { label: 'Heart Rate', value: `${p.hr}`, unit: 'bpm', color: p.hr > 80 ? 'var(--accent-amber)' : 'var(--accent-emerald)' },
                { label: 'Blood Sugar', value: `${p.sugar}`, unit: 'mg/dL', color: p.sugar > 140 ? 'var(--accent-amber)' : 'var(--accent-emerald)' },
                { label: 'Last Visit', value: p.lastVisit, color: 'var(--text-secondary)' },
                { label: 'Next Visit', value: p.nextVisit, color: 'var(--primary-soft)' },
              ].map((v, j) => (
                <div key={j} style={{ padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{v.label}</div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: v.color }}>
                    {v.value} {v.unit && <span style={{ fontWeight: 400, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{v.unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><User size={32} /></div>
          <h3>No patients found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try a different search term</p>
        </div>
      )}

      {/* Patient Detail Modal */}
      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title={selectedPatient?.name || ''}
        subtitle={selectedPatient ? `${selectedPatient.gender}, Age ${selectedPatient.age}` : ''}
        maxWidth="640px"
      >
        {selectedPatient && (
          <div>
            {/* Conditions */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {selectedPatient.conditions.map((c, i) => (
                <span key={i} className="badge badge-info">{c}</span>
              ))}
              <span className="badge" style={{ background: `${riskColor(selectedPatient.risk)}18`, color: riskColor(selectedPatient.risk) }}>
                {selectedPatient.risk} risk
              </span>
            </div>

            {/* Vitals Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Blood Pressure', value: selectedPatient.bp, unit: 'mmHg', icon: Activity },
                { label: 'Heart Rate', value: `${selectedPatient.hr}`, unit: 'bpm', icon: Heart },
                { label: 'Blood Sugar', value: `${selectedPatient.sugar}`, unit: 'mg/dL', icon: TrendingDown },
                { label: 'SpO2', value: `${selectedPatient.spo2}%`, icon: Activity },
                { label: 'Weight', value: selectedPatient.weight, icon: User },
                { label: 'Adherence', value: `${selectedPatient.adherence}%`, icon: CheckCircle2 },
              ].map((v, j) => (
                <div key={j} style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
                  <v.icon size={16} style={{ color: 'var(--primary-soft)', marginBottom: '4px' }} />
                  <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{v.value}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{v.label}</div>
                </div>
              ))}
            </div>

            {/* Medications */}
            <h3 style={{ fontWeight: 600, marginBottom: '10px', fontSize: 'var(--font-size-sm)' }}>Current Medications</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              {selectedPatient.medications.map((med, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)' }}>
                  <Pill size={14} style={{ color: 'var(--primary-soft)' }} />
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>{med}</span>
                </div>
              ))}
            </div>

            {/* Clinical Notes */}
            <h3 style={{ fontWeight: 600, marginBottom: '10px', fontSize: 'var(--font-size-sm)' }}>Clinical Notes</h3>
            <div style={{ padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              {selectedPatient.notes}
            </div>

            {/* Appointments */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Last Visit</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{selectedPatient.lastVisit}</div>
              </div>
              <div style={{ flex: 1, padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Next Visit</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--primary-soft)' }}>{selectedPatient.nextVisit}</div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <motion.button className="btn btn-primary btn-sm" style={{ flex: 1 }} whileTap={{ scale: 0.97 }} onClick={() => { handleVideoCall(selectedPatient); setSelectedPatient(null); }}>
                <Video size={16} /> Video Call
              </motion.button>
              <motion.button className="btn btn-ghost btn-sm" style={{ flex: 1 }} whileTap={{ scale: 0.97 }} onClick={() => { handleCall(selectedPatient); setSelectedPatient(null); }}>
                <Phone size={16} /> Phone Call
              </motion.button>
            </div>

            {/* Add Clinical Note — only for live patients */}
            {selectedPatient.isLive && (
              <>
                <h3 style={{ fontWeight: 600, marginBottom: '10px', fontSize: 'var(--font-size-sm)' }}>Add Clinical Note</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    className="input"
                    placeholder="Type a clinical note..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <motion.button
                    className="btn btn-primary btn-sm"
                    whileTap={{ scale: 0.95 }}
                    disabled={!noteText.trim()}
                    style={{ opacity: noteText.trim() ? 1 : 0.5 }}
                    onClick={() => {
                      addDoctorNote({ text: noteText.trim(), doctor: 'Dr. Priya Sharma', patientId: selectedPatient.id });
                      addAlert({ type: 'clinical', message: `Dr. Priya added a note for ${selectedPatient.name}`, severity: 'info', source: 'doctor' });
                      addToast('Clinical note saved', 'success');
                      setNoteText('');
                    }}
                  >
                    Save Note
                  </motion.button>
                </div>
                {doctorNotes.filter(n => n.patientId === selectedPatient.id).length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {doctorNotes.filter(n => n.patientId === selectedPatient.id).slice(0, 5).map(note => (
                      <div key={note.id} style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-sm)' }}>
                        <div style={{ color: 'var(--text-secondary)' }}>{note.text}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>{note.doctor} • {note.date}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Video Call Modal */}
      <Modal
        isOpen={showVideoCall}
        onClose={endVideoCall}
        title="Video Consultation"
        subtitle={videoCallPatient ? `With ${videoCallPatient.name}` : ''}
        maxWidth="600px"
      >
        {videoCallPatient && (
          <div>
            <div style={{
              height: '320px', background: 'linear-gradient(135deg, #0F172A, #1E293B)',
              borderRadius: 'var(--border-radius-sm)', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.05,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }} />
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${riskColor(videoCallPatient.risk)}, var(--primary))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 700, marginBottom: '16px'
              }}>
                {videoCallPatient.avatar}
              </div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{videoCallPatient.name}</div>
              <div style={{ color: 'var(--accent-emerald)', fontSize: 'var(--font-size-sm)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', animation: 'sos-pulse 2s infinite' }} />
                Connected
              </div>

              {/* Self view */}
              <div style={{
                position: 'absolute', bottom: '16px', right: '16px',
                width: '120px', height: '90px', background: 'rgba(79,107,255,0.15)',
                borderRadius: '10px', border: '2px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700
              }}>
                You
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <motion.button className="btn btn-danger" whileTap={{ scale: 0.95 }} onClick={endVideoCall} style={{ minWidth: '160px' }}>
                <Phone size={18} /> End Call
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
