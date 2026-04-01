'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  User, Heart, Activity, Pill, MapPin, Phone,
  ChevronRight, Eye, TrendingUp, TrendingDown, Plus, Video, X
} from 'lucide-react';
import { MOCK_USERS, MOCK_VITALS } from '@/lib/mockData';
import { useToast } from '@/lib/Toast';
import Modal from '@/lib/Modal';

export default function CaregiverPatientsPage() {
  const { addToast } = useToast();
  const patient = MOCK_USERS.patient;
  const [showLinkPatient, setShowLinkPatient] = useState(false);
  const [linkForm, setLinkForm] = useState({ name: '', phone: '', relation: '', code: '' });
  const [calling, setCalling] = useState(null);
  const [showVideoCall, setShowVideoCall] = useState(false);

  const [patients, setPatients] = useState([
    {
      ...patient,
      lastActive: '2 min ago',
      status: 'online',
      location: 'Home',
      adherence: 87,
      heartRate: MOCK_VITALS.heartRate.current,
      bloodSugar: MOCK_VITALS.bloodSugar.current,
    },
  ]);

  const handleCall = (p) => {
    setCalling(p.id);
    addToast(`📞 Calling ${p.name} at ${p.phone}...`, 'info');
    setTimeout(() => {
      setCalling(null);
      addToast(`📱 Call with ${p.name} connected`, 'success');
    }, 2000);
  };

  const handleVideoCall = (p) => {
    setShowVideoCall(true);
    addToast(`📹 Starting video call with ${p.name}...`, 'info');
  };

  const handleCallEmergency = (contact) => {
    addToast(`📞 Calling ${contact.name} (${contact.relation}) at ${contact.phone}...`, 'info');
    setTimeout(() => {
      addToast(`📱 Connected with ${contact.name}`, 'success');
    }, 1500);
  };

  const handleLinkPatient = () => {
    if (!linkForm.name || !linkForm.phone || !linkForm.code) {
      addToast('Please fill in name, phone, and linking code', 'warning');
      return;
    }
    const newPatient = {
      id: `usr_patient_${Date.now()}`,
      name: linkForm.name,
      role: 'patient',
      age: 70,
      avatar: linkForm.name.split(' ').map(w => w[0]).join('').substring(0, 2),
      phone: linkForm.phone,
      conditions: ['General Care'],
      emergencyContacts: [],
      location: { address: 'Location pending' },
      lastActive: 'Just linked',
      status: 'offline',
      locationLabel: 'Unknown',
      adherence: 0,
      heartRate: '--',
      bloodSugar: '--',
    };
    setPatients(prev => [...prev, newPatient]);
    setShowLinkPatient(false);
    setLinkForm({ name: '', phone: '', relation: '', code: '' });
    addToast(`✅ ${linkForm.name} linked successfully! They will appear once their device syncs.`, 'success');
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Linked Patients</h1>
            <p className="page-description">Manage and monitor your linked family members</p>
          </div>
          <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={() => setShowLinkPatient(true)}>
            <Plus size={18} /> Link New Patient
          </motion.button>
        </div>
      </div>

      {patients.map((p, i) => (
        <motion.div
          key={p.id}
          className="card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          style={{ marginBottom: '20px' }}
        >
          {/* Patient Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--accent-teal))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 700
              }}>
                {p.avatar}
              </div>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-xl)' }}>{p.name}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                  {p.age ? `Age ${p.age} • ` : ''}{p.conditions?.join(', ') || 'General Care'}
                </p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <span className={`badge ${p.status === 'online' ? 'badge-success' : 'badge-warning'}`}>
                    {p.status === 'online' ? '🟢' : '🟡'} {p.status}
                  </span>
                  <span className="badge badge-info">🏠 {p.location || p.locationLabel}</span>
                  <span className="badge badge-info">Last seen: {p.lastActive}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.button
                className="btn btn-danger btn-sm"
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCall(p)}
                disabled={calling === p.id}
                style={{ opacity: calling === p.id ? 0.7 : 1 }}
              >
                <Phone size={16} /> {calling === p.id ? 'Calling...' : 'Call'}
              </motion.button>
              {p.status === 'online' && (
                <motion.button
                  className="btn btn-primary btn-sm"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVideoCall(p)}
                >
                  <Video size={16} /> Video
                </motion.button>
              )}
            </div>
          </div>

          {/* Vitals Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Heart Rate', value: typeof p.heartRate === 'number' ? `${p.heartRate} bpm` : p.heartRate, icon: Heart, color: 'rose', trend: 'Stable' },
              { label: 'Blood Sugar', value: typeof p.bloodSugar === 'number' ? `${p.bloodSugar} mg/dL` : p.bloodSugar, icon: Activity, color: 'amber', trend: 'Improving' },
              { label: 'Med Adherence', value: `${p.adherence}%`, icon: Pill, color: 'emerald', trend: '+5%' },
              { label: 'Blood Pressure', value: MOCK_VITALS.bloodPressure.current, icon: TrendingUp, color: 'purple', trend: 'Stable' },
              { label: 'SpO2', value: `${MOCK_VITALS.spo2.current}%`, icon: Activity, color: 'teal', trend: 'Normal' },
              { label: 'Steps Today', value: '3,200', icon: Activity, color: 'primary', trend: '64%' },
            ].map((v, j) => (
              <div key={j} className={`stat-card ${v.color}`} style={{ padding: '16px' }}>
                <div className={`stat-icon ${v.color}`} style={{ width: '36px', height: '36px', borderRadius: '8px' }}>
                  <v.icon size={18} />
                </div>
                <div className="stat-value" style={{ fontSize: 'var(--font-size-xl)' }}>{v.value}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="stat-label" style={{ fontSize: 'var(--font-size-xs)' }}>{v.label}</span>
                  <span className="stat-trend up" style={{ fontSize: '0.7rem' }}>{v.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Emergency Contacts */}
          {p.emergencyContacts && p.emergencyContacts.length > 0 && (
            <>
              <h3 style={{ fontWeight: 600, marginBottom: '12px' }}>Emergency Contacts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {p.emergencyContacts.map((c) => (
                  <div key={c.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                    background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)'
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'var(--primary-glow)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'var(--primary-soft)'
                    }}>
                      <User size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{c.name}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{c.relation} • {c.phone}</div>
                    </div>
                    <motion.button
                      className="btn btn-ghost btn-sm"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCallEmergency(c)}
                      style={{ padding: '6px 10px', minHeight: 'unset' }}
                    >
                      <Phone size={14} />
                    </motion.button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Quick Links */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/caregiver/medications"><button className="btn btn-ghost btn-sm"><Pill size={16} /> Medications</button></Link>
            <Link href="/caregiver/location"><button className="btn btn-ghost btn-sm"><MapPin size={16} /> Location</button></Link>
            <Link href="/caregiver/activity"><button className="btn btn-ghost btn-sm"><Activity size={16} /> Activity</button></Link>
            <Link href="/caregiver/alerts"><button className="btn btn-ghost btn-sm"><Eye size={16} /> Alerts</button></Link>
          </div>
        </motion.div>
      ))}

      {/* Link Patient Modal */}
      <Modal isOpen={showLinkPatient} onClose={() => setShowLinkPatient(false)} title="Link New Patient" subtitle="Connect a family member to your dashboard">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="input-group">
            <label className="input-label">Patient Name</label>
            <input className="input" placeholder="e.g. Suresh Kumar" value={linkForm.name} onChange={(e) => setLinkForm(prev => ({ ...prev, name: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <input className="input" placeholder="+91 98765 00000" value={linkForm.phone} onChange={(e) => setLinkForm(prev => ({ ...prev, phone: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Relationship</label>
            <select className="input" value={linkForm.relation} onChange={(e) => setLinkForm(prev => ({ ...prev, relation: e.target.value }))} style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
              <option value="">Select relationship...</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Grandfather">Grandfather</option>
              <option value="Grandmother">Grandmother</option>
              <option value="Uncle">Uncle</option>
              <option value="Aunt">Aunt</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Linking Code</label>
            <input className="input" placeholder="Enter 6-digit code from patient's device" value={linkForm.code} onChange={(e) => setLinkForm(prev => ({ ...prev, code: e.target.value }))} maxLength={6} />
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
              The patient will receive a code on their device when they enable sharing.
            </p>
          </div>

          <div style={{ padding: '14px', background: 'var(--accent-teal-soft)', borderRadius: 'var(--border-radius-sm)', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Eye size={16} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-teal)' }}>
              You'll be able to see their vitals, medications, location, and alerts after linking.
            </span>
          </div>

          <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={handleLinkPatient} style={{ width: '100%' }}>
            <Plus size={18} /> Link Patient
          </motion.button>
        </div>
      </Modal>

      {/* Video Call Modal */}
      <Modal isOpen={showVideoCall} onClose={() => setShowVideoCall(false)} title="Video Call" subtitle={`With ${patients[0]?.name}`} maxWidth="600px">
        <div>
          <div style={{
            height: '300px', background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            borderRadius: 'var(--border-radius-sm)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent-teal))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700, marginBottom: '16px'
            }}>
              {patients[0]?.avatar}
            </div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{patients[0]?.name}</div>
            <div style={{ color: 'var(--accent-emerald)', fontSize: 'var(--font-size-sm)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)', animation: 'sos-pulse 2s infinite' }} />
              Connected
            </div>
            <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '100px', height: '75px', background: 'rgba(79,107,255,0.15)', borderRadius: '10px', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
              You
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <motion.button className="btn btn-danger" whileTap={{ scale: 0.95 }} onClick={() => { setShowVideoCall(false); addToast('📹 Video call ended', 'success'); }}>
              <Phone size={18} /> End Call
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
