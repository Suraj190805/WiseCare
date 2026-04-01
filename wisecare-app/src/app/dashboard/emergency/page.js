'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Phone, MapPin, Clock, Shield, X,
  Plus, Trash2, ChevronUp, ChevronDown, User, Heart
} from 'lucide-react';
import { MOCK_USERS } from '@/lib/mockData';

export default function EmergencyPage() {
  const [isSosActive, setIsSosActive] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isAlertSent, setIsAlertSent] = useState(false);
  const [contacts, setContacts] = useState(MOCK_USERS.patient.emergencyContacts);
  const [showAddContact, setShowAddContact] = useState(false);
  const [alertHistory, setAlertHistory] = useState([
    { id: 1, time: 'Mar 28, 2:15 PM', type: 'Manual SOS', status: 'Resolved', respondedBy: 'Meera Kumar', responseTime: '3 min' },
    { id: 2, time: 'Mar 20, 7:30 AM', type: 'Fall Detection', status: 'False Alarm', respondedBy: 'Auto-cancelled', responseTime: '8 sec' },
  ]);

  const triggerSOS = () => {
    setIsSosActive(true);
    setCountdown(10);
    setIsAlertSent(false);
  };

  const cancelSOS = () => {
    setIsSosActive(false);
    setCountdown(10);
  };

  useEffect(() => {
    if (!isSosActive || isAlertSent) return;

    if (countdown <= 0) {
      setIsAlertSent(true);
      // Simulate sending alert
      setAlertHistory(prev => [{
        id: Date.now(),
        time: new Date().toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
        type: 'Manual SOS',
        status: 'Active',
        respondedBy: 'Pending...',
        responseTime: '—',
      }, ...prev]);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isSosActive, countdown, isAlertSent]);

  const resolveAlert = () => {
    setIsSosActive(false);
    setIsAlertSent(false);
    setCountdown(10);
    setAlertHistory(prev => prev.map((a, i) =>
      i === 0 && a.status === 'Active' ? { ...a, status: 'Resolved', respondedBy: 'Self', responseTime: 'Just now' } : a
    ));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Emergency SOS</h1>
        <p className="page-description">Quick emergency alerts to your contacts and services</p>
      </div>

      <div className="grid-2">
        {/* Left — SOS Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px' }}>
            <AnimatePresence mode="wait">
              {!isSosActive ? (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ textAlign: 'center' }}
                >
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    Press and hold the button in case of emergency
                  </p>
                  <motion.button
                    className="sos-btn"
                    onClick={triggerSOS}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    SOS
                    <span className="sos-btn-label">TAP FOR HELP</span>
                  </motion.button>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '24px' }}>
                    You'll have 10 seconds to cancel
                  </p>
                </motion.div>
              ) : !isAlertSent ? (
                <motion.div
                  key="counting"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ textAlign: 'center' }}
                >
                  <motion.div
                    animate={{ color: ['#F43F5E', '#EF4444', '#F43F5E'] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, marginBottom: '24px' }}
                  >
                    ⚠️ Sending SOS in...
                  </motion.div>

                  {/* Countdown Ring */}
                  <div className="countdown-ring" style={{ margin: '0 auto 24px' }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border-subtle)" strokeWidth="6" />
                      <motion.circle
                        cx="60" cy="60" r="54" fill="none" stroke="var(--accent-rose)" strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={339.3}
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: 339.3 }}
                        transition={{ duration: 10, ease: 'linear' }}
                      />
                    </svg>
                    <div className="countdown-ring-text" style={{ color: 'var(--accent-rose)' }}>
                      {countdown}
                    </div>
                  </div>

                  <motion.button
                    className="btn btn-lg"
                    onClick={cancelSOS}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: 'var(--bg-elevated)', border: '2px solid var(--border-default)',
                      color: 'var(--text-primary)', width: '200px'
                    }}
                  >
                    <X size={20} /> CANCEL
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center' }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      width: '100px', height: '100px', borderRadius: '50%',
                      background: 'var(--accent-rose-soft)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', margin: '0 auto 24px', border: '3px solid var(--accent-rose)'
                    }}
                  >
                    <AlertTriangle size={48} style={{ color: 'var(--accent-rose)' }} />
                  </motion.div>

                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)', color: 'var(--accent-rose)', marginBottom: '8px' }}>
                    🚨 SOS Alert Sent!
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    All emergency contacts have been notified with your location
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    {contacts.map(c => (
                      <div key={c.id} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
                        background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)'
                      }}>
                        <Phone size={16} style={{ color: 'var(--accent-emerald)' }} />
                        <span style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}>{c.name}</span>
                        <span className="badge badge-success">Notified ✓</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '24px', padding: '12px', background: 'rgba(45, 212, 191, 0.08)', borderRadius: 'var(--border-radius-sm)' }}>
                    <MapPin size={16} style={{ color: 'var(--accent-teal)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)' }}>
                      Location shared: Jayanagar, Bangalore
                    </span>
                  </div>

                  <motion.button
                    className="btn btn-teal btn-lg"
                    onClick={resolveAlert}
                    whileTap={{ scale: 0.95 }}
                    style={{ width: '100%' }}
                  >
                    <Shield size={18} /> I'm OK — Resolve Alert
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Call */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '12px' }}>Quick Call</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <motion.button className="btn btn-danger" whileTap={{ scale: 0.97 }}>
                <Phone size={18} /> Emergency 112
              </motion.button>
              <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }}>
                <Phone size={18} /> Call Doctor
              </motion.button>
            </div>
          </div>
        </div>

        {/* Right — Contacts & History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Emergency Contacts */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title">Emergency Contacts</h2>
              <motion.button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowAddContact(!showAddContact)}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={16} /> Add
              </motion.button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {contacts.map((contact, i) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '16px',
                    background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: i === 0 ? 'var(--accent-rose-soft)' : i === 1 ? 'var(--accent-teal-soft)' : 'var(--primary-glow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: i === 0 ? 'var(--accent-rose)' : i === 1 ? 'var(--accent-teal)' : 'var(--primary-soft)',
                  }}>
                    <User size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{contact.name}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {contact.relation} • {contact.phone}
                    </div>
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    Priority {contact.priority}
                  </span>
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {showAddContact && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden', marginTop: '16px' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-accent)' }}>
                    <div className="input-group">
                      <label className="input-label">Name</label>
                      <input className="input" placeholder="Contact name" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="input-group">
                        <label className="input-label">Phone</label>
                        <input className="input" placeholder="+91 ..." />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Relation</label>
                        <input className="input" placeholder="e.g., Son" />
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddContact(false)}>
                      Add Contact
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Alert History */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '16px' }}>Alert History</h2>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Response</th>
                  </tr>
                </thead>
                <tbody>
                  {alertHistory.map((alert) => (
                    <tr key={alert.id}>
                      <td style={{ fontSize: 'var(--font-size-sm)' }}>{alert.time}</td>
                      <td><span className={`badge ${alert.type === 'Fall Detection' ? 'badge-warning' : 'badge-danger'}`}>{alert.type}</span></td>
                      <td><span className={`badge ${alert.status === 'Active' ? 'badge-danger' : alert.status === 'Resolved' ? 'badge-success' : 'badge-info'}`}>{alert.status}</span></td>
                      <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{alert.responseTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
