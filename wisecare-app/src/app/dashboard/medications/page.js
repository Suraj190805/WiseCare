'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill, Clock, CheckCircle2, XCircle, Plus, AlertCircle,
  TrendingUp, Calendar, Info, ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';
import { MOCK_MEDICATIONS, MOCK_MED_LOGS, MOCK_ADHERENCE_WEEKLY } from '@/lib/mockData';

const COLORS = ['teal', 'primary', 'purple', 'amber', 'emerald', 'rose'];

const STORAGE_KEYS = {
  MEDICATIONS: 'wisecare_medications',
  MED_LOGS: 'wisecare_med_logs',
};

function loadFromStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export default function MedicationsPage() {
  const [activeTab, setActiveTab] = useState('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [medications, setMedications] = useState(() => loadFromStorage(STORAGE_KEYS.MEDICATIONS, [...MOCK_MEDICATIONS]));
  const [medLogs, setMedLogs] = useState(() => loadFromStorage(STORAGE_KEYS.MED_LOGS, [...MOCK_MED_LOGS]));

  // Persist to localStorage on change
  useEffect(() => { saveToStorage(STORAGE_KEYS.MEDICATIONS, medications); }, [medications]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.MED_LOGS, medLogs); }, [medLogs]);

  // Add medication form state
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    times: '',
  });

  const adherenceRate = medLogs.length > 0
    ? Math.round((medLogs.filter(l => l.status === 'taken').length / medLogs.length) * 100)
    : 0;

  const handleTakeMed = (logId) => {
    setMedLogs(prev => prev.map(l =>
      l.id === logId ? { ...l, status: 'taken' } : l
    ));
  };

  const handleSkipMed = (logId) => {
    setMedLogs(prev => prev.map(l =>
      l.id === logId ? { ...l, status: 'skipped' } : l
    ));
  };

  const handleAddMedication = () => {
    if (!newMed.name.trim()) return;

    const medId = `med_${Date.now()}`;
    const timesArray = newMed.times
      ? newMed.times.split(',').map(t => t.trim()).filter(Boolean)
      : ['08:00'];
    const color = COLORS[medications.length % COLORS.length];

    // Create the new medication object
    const medication = {
      id: medId,
      name: newMed.name.trim(),
      dosage: newMed.dosage.trim() || 'N/A',
      frequency: newMed.frequency.trim() || 'As directed',
      times: timesArray,
      color,
      instructions: newMed.instructions.trim() || 'Follow doctor\'s instructions',
      remaining: 30,
      total: 30,
    };

    // Create log entries for each scheduled time
    const newLogs = timesArray.map((time, idx) => ({
      id: `log_${Date.now()}_${idx}`,
      medId,
      time,
      status: 'pending',
      date: 'today',
    }));

    // Update state (localStorage will sync via useEffect)
    setMedications(prev => [...prev, medication]);
    setMedLogs(prev => [...prev, ...newLogs]);

    // Reset form and close modal
    setNewMed({ name: '', dosage: '', frequency: '', instructions: '', times: '' });
    setShowAddModal(false);
  };

  const monthlyData = [
    { week: 'W1', rate: 82 }, { week: 'W2', rate: 88 },
    { week: 'W3', rate: 75 }, { week: 'W4', rate: 91 },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Medications</h1>
            <p className="page-description">Track and manage your daily medications</p>
          </div>
          <motion.button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} /> Add Medication
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card primary">
          <div className="stat-icon primary"><Pill size={22} /></div>
          <div className="stat-value">{medications.length}</div>
          <div className="stat-label">Active Medications</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="stat-value">{adherenceRate}%</div>
          <div className="stat-label">Today's Adherence</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Clock size={22} /></div>
          <div className="stat-value">{medLogs.filter(l => l.status === 'pending').length}</div>
          <div className="stat-label">Pending Today</div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon teal"><TrendingUp size={22} /></div>
          <div className="stat-value">87%</div>
          <div className="stat-label">Monthly Average</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pill-tabs" style={{ marginBottom: '24px' }}>
        {['today', 'all', 'history'].map(tab => (
          <button
            key={tab}
            className={`pill-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'today' ? "Today's Schedule" : tab === 'all' ? 'All Medications' : 'Adherence History'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'today' && (
          <motion.div
            key="today"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Timeline */}
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '24px' }}>Today's Schedule</h2>
              <div className="timeline">
                {medLogs.map((log) => {
                  const med = medications.find(m => m.id === log.medId);
                  if (!med) return null;
                  return (
                    <div key={log.id} className="timeline-item">
                      <div className={`timeline-dot ${log.status === 'taken' ? 'done' : log.status === 'skipped' ? 'missed' : ''}`} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <div className="timeline-time">{log.time}</div>
                          <div style={{ fontWeight: 600 }}>{med.name} {med.dosage}</div>
                          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                            {med.instructions}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {log.status === 'pending' ? (
                            <>
                              <motion.button
                                className="btn btn-teal btn-sm"
                                onClick={() => handleTakeMed(log.id)}
                                whileTap={{ scale: 0.95 }}
                              >
                                <CheckCircle2 size={16} /> Take
                              </motion.button>
                              <motion.button
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleSkipMed(log.id)}
                                whileTap={{ scale: 0.95 }}
                              >
                                Skip
                              </motion.button>
                            </>
                          ) : (
                            <span className={`badge ${log.status === 'taken' ? 'badge-success' : 'badge-danger'}`}>
                              {log.status === 'taken' ? '✓ Taken' : '✗ Skipped'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'all' && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {medications.map((med, i) => (
              <motion.div
                key={med.id}
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className={`stat-icon ${med.color}`} style={{ width: '56px', height: '56px', borderRadius: '14px' }}>
                      <Pill size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{med.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        {med.dosage} • {med.frequency}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                        {med.instructions}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      {med.times.map((t, j) => (
                        <span key={j} className="badge badge-info">{t}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {med.remaining}/{med.total} remaining
                    </div>
                    <div className="progress-bar" style={{ width: '120px', marginTop: '6px', marginLeft: 'auto' }}>
                      <div className={`progress-fill ${med.color}`} style={{ width: `${(med.remaining / med.total) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="grid-2">
              <div className="card">
                <h2 className="card-title" style={{ marginBottom: '16px' }}>Weekly Adherence</h2>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_ADHERENCE_WEEKLY}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }}
                        formatter={(v) => [`${v}%`, 'Adherence']}
                      />
                      <Bar dataKey="adherence" radius={[6, 6, 0, 0]} fill="#4F6BFF" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card">
                <h2 className="card-title" style={{ marginBottom: '16px' }}>Monthly Trend</h2>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }}
                        formatter={(v) => [`${v}%`, 'Rate']}
                      />
                      <Line type="monotone" dataKey="rate" stroke="#2DD4BF" strokeWidth={3} dot={{ fill: '#2DD4BF', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Medication Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card"
              style={{ maxWidth: '500px', width: '100%' }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="card-title" style={{ marginBottom: '24px' }}>Add New Medication</h2>
              <div className="input-group" style={{ marginBottom: '16px' }}>
                <label className="input-label">Medication Name</label>
                <input
                  className="input"
                  placeholder="e.g., Metformin"
                  value={newMed.name}
                  onChange={e => setNewMed(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Dosage</label>
                  <input
                    className="input"
                    placeholder="e.g., 500mg"
                    value={newMed.dosage}
                    onChange={e => setNewMed(prev => ({ ...prev, dosage: e.target.value }))}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Frequency</label>
                  <input
                    className="input"
                    placeholder="e.g., Twice daily"
                    value={newMed.frequency}
                    onChange={e => setNewMed(prev => ({ ...prev, frequency: e.target.value }))}
                  />
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: '16px' }}>
                <label className="input-label">Instructions</label>
                <input
                  className="input"
                  placeholder="e.g., Take with food"
                  value={newMed.instructions}
                  onChange={e => setNewMed(prev => ({ ...prev, instructions: e.target.value }))}
                />
              </div>
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label className="input-label">Time(s)</label>
                <input
                  className="input"
                  placeholder="e.g., 08:00, 20:00"
                  value={newMed.times}
                  onChange={e => setNewMed(prev => ({ ...prev, times: e.target.value }))}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => { setShowAddModal(false); setNewMed({ name: '', dosage: '', frequency: '', instructions: '', times: '' }); }}>Cancel</button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddMedication}
                  disabled={!newMed.name.trim()}
                  style={{ opacity: newMed.name.trim() ? 1 : 0.5 }}
                >
                  Add Medication
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

