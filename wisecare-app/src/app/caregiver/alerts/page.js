'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle2, Clock, Filter, Trash2, X } from 'lucide-react';
import { MOCK_ALERTS } from '@/lib/mockData';
import { useToast } from '@/lib/Toast';

export default function CaregiverAlertsPage() {
  const { addToast } = useToast();
  const [filter, setFilter] = useState('all');
  const [alerts, setAlerts] = useState([
    ...MOCK_ALERTS,
    { id: 'alert_6', type: 'vitals', message: 'Heart rate elevated to 95 bpm during afternoon walk', time: 'Yesterday, 3:15 PM', severity: 'warning', read: true },
    { id: 'alert_7', type: 'medication', message: 'Atorvastatin dose taken on time (9:00 PM)', time: 'Yesterday, 9:02 PM', severity: 'info', read: true },
    { id: 'alert_8', type: 'location', message: 'Rajan returned to Home safe zone', time: '2 days ago', severity: 'info', read: true },
    { id: 'alert_9', type: 'activity', message: 'Daily step goal achieved (5,000 steps)', time: '2 days ago', severity: 'info', read: true },
    { id: 'alert_10', type: 'vitals', message: 'Blood sugar fasting reading: 135 mg/dL (within range)', time: '3 days ago', severity: 'info', read: true },
  ]);

  const filteredAlerts = filter === 'all' ? alerts :
    filter === 'unread' ? alerts.filter(a => !a.read) :
    alerts.filter(a => a.type === filter);

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    addToast('All alerts marked as read', 'success');
  };

  const markRead = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    addToast('Alert marked as read', 'success');
  };

  const deleteAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    addToast('Alert dismissed', 'info');
  };

  const clearAll = () => {
    setAlerts([]);
    addToast('All alerts cleared', 'info');
  };

  const severityIcon = (severity) => {
    if (severity === 'danger') return <AlertTriangle size={18} style={{ color: 'var(--accent-rose)' }} />;
    if (severity === 'warning') return <Clock size={18} style={{ color: 'var(--accent-amber)' }} />;
    return <CheckCircle2 size={18} style={{ color: 'var(--accent-teal)' }} />;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Alerts & Notifications</h1>
            <p className="page-description">Monitor all health events for Rajan Kumar</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button className="btn btn-ghost btn-sm" onClick={markAllRead} whileTap={{ scale: 0.97 }}>
              <CheckCircle2 size={16} /> Mark All Read
            </motion.button>
            <motion.button className="btn btn-ghost btn-sm" onClick={clearAll} whileTap={{ scale: 0.97 }} style={{ color: 'var(--accent-rose)' }}>
              <Trash2 size={16} /> Clear All
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card rose">
          <div className="stat-icon rose"><AlertTriangle size={22} /></div>
          <div className="stat-value">{alerts.filter(a => a.severity === 'danger').length}</div>
          <div className="stat-label">Critical Alerts</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Clock size={22} /></div>
          <div className="stat-value">{alerts.filter(a => a.severity === 'warning').length}</div>
          <div className="stat-label">Warnings</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-icon primary"><Bell size={22} /></div>
          <div className="stat-value">{alerts.filter(a => !a.read).length}</div>
          <div className="stat-label">Unread</div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon teal"><CheckCircle2 size={22} /></div>
          <div className="stat-value">{alerts.length}</div>
          <div className="stat-label">Total This Week</div>
        </div>
      </div>

      {/* Filters */}
      <div className="pill-tabs" style={{ marginBottom: '24px' }}>
        {[
          { key: 'all', label: `All (${alerts.length})` },
          { key: 'unread', label: `Unread (${alerts.filter(a => !a.read).length})` },
          { key: 'medication', label: 'Medication' },
          { key: 'vitals', label: 'Vitals' },
          { key: 'location', label: 'Location' },
          { key: 'activity', label: 'Activity' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`pill-tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <AnimatePresence>
          {filteredAlerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 100, height: 0, marginBottom: 0, padding: 0 }}
              transition={{ delay: i * 0.03 }}
              layout
              style={{
                padding: '18px 20px',
                borderLeft: `4px solid ${alert.severity === 'danger' ? 'var(--accent-rose)' : alert.severity === 'warning' ? 'var(--accent-amber)' : 'var(--accent-teal)'}`,
                background: !alert.read ? 'rgba(79, 107, 255, 0.05)' : 'var(--bg-card)',
                border: `1px solid ${!alert.read ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
                borderLeftWidth: '4px',
                borderRadius: 'var(--border-radius-sm)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '12px'
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1 }}>
                {severityIcon(alert.severity)}
                <div>
                  <div style={{ fontWeight: !alert.read ? 600 : 400, fontSize: 'var(--font-size-sm)' }}>{alert.message}</div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{alert.time}</span>
                    <span className={`badge ${alert.type === 'medication' ? 'badge-info' : alert.type === 'vitals' ? 'badge-warning' : alert.type === 'sos' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                      {alert.type}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {!alert.read && (
                  <motion.button
                    className="btn btn-ghost btn-sm"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => markRead(alert.id)}
                    style={{ padding: '4px 10px', minHeight: 'unset', fontSize: 'var(--font-size-xs)' }}
                  >
                    <CheckCircle2 size={12} /> Read
                  </motion.button>
                )}
                <motion.button
                  className="btn btn-ghost btn-sm"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteAlert(alert.id)}
                  style={{ padding: '4px 8px', minHeight: 'unset', color: 'var(--text-muted)' }}
                >
                  <X size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAlerts.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Bell size={32} /></div>
          <h3>No alerts found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {filter === 'all' ? 'All alerts have been cleared' : 'Try a different filter'}
          </p>
        </div>
      )}
    </div>
  );
}
