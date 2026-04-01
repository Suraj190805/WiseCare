'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, CheckCircle2, Clock, AlertTriangle, Calendar, TrendingUp, Package, Bell, ShoppingCart, Undo2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { MOCK_ADHERENCE_WEEKLY, MOCK_USERS } from '@/lib/mockData';
import { useSharedData } from '@/lib/SharedDataStore';
import { useToast } from '@/lib/Toast';
import Modal from '@/lib/Modal';

export default function CaregiverMedicationsPage() {
  const { addToast } = useToast();
  const { medications, medLogs, takeMed, skipMed, adherenceRate, addAlert, addActivity } = useSharedData();
  const patient = MOCK_USERS.patient;
  const [showRefill, setShowRefill] = useState(false);
  const [refillMed, setRefillMed] = useState(null);

  const taken = medLogs.filter(l => l.status === 'taken').length;
  const pending = medLogs.filter(l => l.status === 'pending').length;
  const missed = medLogs.filter(l => l.status === 'skipped' || l.status === 'missed').length;
  const total = medLogs.length;

  const handleMarkTaken = (logId) => {
    const log = medLogs.find(l => l.id === logId);
    const med = medications.find(m => m.id === log?.medId);
    takeMed(logId);
    addActivity({ type: 'medication', message: `Meera confirmed ${med?.name} ${med?.dosage} taken by Rajan`, role: 'caregiver', icon: '✅' });
    addToast(`✅ ${med?.name} marked as taken`, 'success');
  };

  const handleMarkMissed = (logId) => {
    const log = medLogs.find(l => l.id === logId);
    const med = medications.find(m => m.id === log?.medId);
    skipMed(logId);
    addToast(`❌ ${med?.name} marked as missed`, 'warning');
  };

  const handleUndoStatus = (logId) => {
    // We can't easily undo through SharedDataStore, but we can reset via takeMed logic
    // For simplicity, we'll use addMedLogs approach — but let's just use the skip mechanism
    addToast('Status reset requested — please have the patient update', 'info');
  };

  const handleRemind = (logId) => {
    const log = medLogs.find(l => l.id === logId);
    const med = medications.find(m => m.id === log?.medId);
    addAlert({
      type: 'medication',
      message: `🔔 Reminder from Meera: Please take ${med?.name} ${med?.dosage}`,
      severity: 'info',
      source: 'caregiver',
    });
    addActivity({ type: 'medication', message: `Meera sent a reminder to Rajan for ${med?.name}`, role: 'caregiver', icon: '🔔' });
    addToast(`🔔 Reminder sent to ${patient.name} for ${med?.name}`, 'info');
  };

  const handleRefillRequest = () => {
    if (refillMed) {
      addAlert({
        type: 'medication',
        message: `📦 Refill ordered for ${refillMed.name} ${refillMed.dosage} — ${refillMed.total} pills`,
        severity: 'info',
        source: 'caregiver',
      });
      addActivity({ type: 'medication', message: `Meera ordered a refill for ${refillMed.name} ${refillMed.dosage}`, role: 'caregiver', icon: '📦' });
      addToast(`✅ Refill ordered for ${refillMed.name} — ${refillMed.total} pills`, 'success');
      setShowRefill(false);
      setRefillMed(null);
    }
  };

  const openRefill = (med) => {
    setRefillMed(med);
    setShowRefill(true);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Medication Tracking</h1>
        <p className="page-description">Monitor {patient.name}'s medication schedule and adherence — Live Data 🟢</p>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="stat-value">{taken}/{total}</div>
          <div className="stat-label">Taken Today</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Clock size={22} /></div>
          <div className="stat-value">{pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-icon primary"><TrendingUp size={22} /></div>
          <div className="stat-value">{adherenceRate}%</div>
          <div className="stat-label">Today's Adherence</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon rose"><AlertTriangle size={22} /></div>
          <div className="stat-value">{missed}</div>
          <div className="stat-label">Missed Today</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Today's Schedule */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Today's Schedule</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {medLogs.map((log) => {
              const med = medications.find(m => m.id === log.medId);
              if (!med) return null;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px',
                    borderLeft: `4px solid ${log.status === 'taken' ? 'var(--accent-emerald)' : (log.status === 'skipped' || log.status === 'missed') ? 'var(--accent-rose)' : 'var(--accent-amber)'}`,
                    background: 'var(--bg-elevated)',
                    borderRadius: '0 var(--border-radius-sm) var(--border-radius-sm) 0',
                    opacity: log.status === 'taken' ? 0.75 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '10px',
                      background: log.status === 'taken' ? 'var(--accent-emerald-soft)' : (log.status === 'skipped' || log.status === 'missed') ? 'var(--accent-rose-soft)' : 'var(--accent-amber-soft)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: log.status === 'taken' ? 'var(--accent-emerald)' : (log.status === 'skipped' || log.status === 'missed') ? 'var(--accent-rose)' : 'var(--accent-amber)'
                    }}>
                      {log.status === 'taken' ? <CheckCircle2 size={20} /> : (log.status === 'skipped' || log.status === 'missed') ? <AlertTriangle size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', textDecoration: log.status === 'taken' ? 'line-through' : 'none' }}>{med.name} {med.dosage}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        ⏰ {log.time} • {med.instructions}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {log.status === 'pending' && (
                      <>
                        <motion.button className="btn btn-primary btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleMarkTaken(log.id)} style={{ padding: '6px 10px', minHeight: 'unset', fontSize: 'var(--font-size-xs)' }}>
                          <CheckCircle2 size={12} /> Taken
                        </motion.button>
                        <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleRemind(log.id)} style={{ padding: '6px 10px', minHeight: 'unset', fontSize: 'var(--font-size-xs)' }}>
                          <Bell size={12} /> Remind
                        </motion.button>
                        <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleMarkMissed(log.id)} style={{ padding: '6px 10px', minHeight: 'unset', fontSize: 'var(--font-size-xs)', color: 'var(--accent-rose)' }}>
                          Miss
                        </motion.button>
                      </>
                    )}
                    {(log.status === 'taken' || log.status === 'skipped' || log.status === 'missed') && (
                      <span className={`badge ${log.status === 'taken' ? 'badge-success' : 'badge-danger'}`}>
                        {log.status === 'taken' ? '✓ Taken' : '✗ Missed'}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Weekly Adherence */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Weekly Adherence</h2>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ADHERENCE_WEEKLY}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }}
                  formatter={(v) => [`${v}%`, 'Adherence']}
                />
                <Bar dataKey="adherence" radius={[8, 8, 0, 0]} fill="#4F6BFF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* All Medications */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h2 className="card-title" style={{ marginBottom: '16px' }}>All Medications</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {medications.map((med) => {
              const stockPercent = (med.remaining / med.total) * 100;
              return (
                <div key={med.id} className="card" style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{med.name}</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{med.dosage} • {med.frequency}</div>
                    </div>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: `var(--accent-${med.color}-soft, var(--primary-glow))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: `var(--accent-${med.color}, var(--primary))`
                    }}>
                      <Pill size={18} />
                    </div>
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    📋 {med.instructions}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Stock: {med.remaining}/{med.total} pills
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${stockPercent > 50 ? 'emerald' : stockPercent > 20 ? 'amber' : 'rose'}`}
                      style={{ width: `${stockPercent}%` }}
                    />
                  </div>
                  {stockPercent < 60 && (
                    <motion.button
                      className={`btn ${stockPercent < 30 ? 'btn-danger' : 'btn-ghost'} btn-sm`}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openRefill(med)}
                      style={{ width: '100%', marginTop: '10px', fontSize: 'var(--font-size-xs)' }}
                    >
                      <ShoppingCart size={14} />
                      {stockPercent < 30 ? '⚠ Refill Now' : 'Order Refill'}
                    </motion.button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Refill Modal */}
      <Modal isOpen={showRefill} onClose={() => setShowRefill(false)} title="Order Medication Refill" subtitle={refillMed ? `${refillMed.name} ${refillMed.dosage}` : ''}>
        {refillMed && (
          <div>
            <div style={{ padding: '20px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Medication</span>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{refillMed.name} {refillMed.dosage}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Current Stock</span>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: refillMed.remaining < 10 ? 'var(--accent-rose)' : 'var(--text-primary)' }}>{refillMed.remaining} pills</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Refill Quantity</span>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{refillMed.total} pills</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Frequency</span>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{refillMed.frequency}</span>
              </div>
            </div>
            <div style={{ padding: '14px', background: 'var(--accent-teal-soft)', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Package size={18} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent-teal)' }}>Estimated delivery: 1-2 business days to {MOCK_USERS.patient.location.address}</span>
            </div>
            <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={handleRefillRequest} style={{ width: '100%' }}>
              <ShoppingCart size={18} /> Confirm Refill Order
            </motion.button>
          </div>
        )}
      </Modal>
    </div>
  );
}
