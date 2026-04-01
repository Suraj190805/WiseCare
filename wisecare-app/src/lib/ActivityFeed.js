'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, Filter, ChevronDown } from 'lucide-react';
import { useSharedData } from './SharedDataStore';

const ROLE_COLORS = {
  patient: { bg: 'rgba(45, 212, 191, 0.1)', color: 'var(--accent-teal)', label: 'Patient' },
  doctor: { bg: 'rgba(79, 107, 255, 0.1)', color: 'var(--primary-soft)', label: 'Doctor' },
  caregiver: { bg: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', label: 'Caregiver' },
  system: { bg: 'rgba(107, 114, 128, 0.1)', color: 'var(--text-muted)', label: 'System' },
};

function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function ActivityFeed({ maxItems = 10, showFilter = true, filterRole = null, compact = false }) {
  const { activityFeed } = useSharedData();
  const [filter, setFilter] = useState(filterRole || 'all');
  const [expanded, setExpanded] = useState(!compact);

  const filtered = filter === 'all'
    ? activityFeed
    : activityFeed.filter(a => a.role === filter);

  const items = filtered.slice(0, maxItems);

  if (compact && !expanded) {
    return (
      <motion.div
        className="card"
        whileHover={{ scale: 1.005 }}
        onClick={() => setExpanded(true)}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'var(--primary-glow)', color: 'var(--primary-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Activity size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Activity Feed</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                {activityFeed.length} recent activities
              </div>
            </div>
          </div>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: 'var(--primary-soft)' }} />
          Activity Feed
        </h2>
        {compact && (
          <button
            onClick={() => setExpanded(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 'var(--font-size-xs)' }}
          >
            Collapse
          </button>
        )}
      </div>

      {showFilter && (
        <div className="pill-tabs" style={{ marginBottom: '14px' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'patient', label: '🧑 Patient' },
            { key: 'doctor', label: '👨‍⚕ Doctor' },
            { key: 'caregiver', label: '👩 Caregiver' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`pill-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => setFilter(tab.key)}
              style={{ fontSize: 'var(--font-size-xs)', padding: '6px 12px', minHeight: 'unset' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <AnimatePresence>
          {items.map((entry, i) => {
            const roleStyle = ROLE_COLORS[entry.role] || ROLE_COLORS.system;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '10px 12px', borderRadius: 'var(--border-radius-sm)',
                  position: 'relative',
                }}
              >
                {/* Timeline line */}
                {i < items.length - 1 && (
                  <div style={{
                    position: 'absolute', left: '23px', top: '32px', bottom: '-10px',
                    width: '2px', background: 'var(--border-subtle)',
                  }} />
                )}
                {/* Icon bubble */}
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: roleStyle.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', flexShrink: 0, zIndex: 1,
                }}>
                  {entry.icon || '📋'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.4 }}>{entry.message}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '3px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={10} /> {timeAgo(entry.timestamp)}
                    </span>
                    <span style={{
                      fontSize: '0.6rem', padding: '1px 6px', borderRadius: '4px',
                      background: roleStyle.bg, color: roleStyle.color, fontWeight: 600,
                    }}>
                      {roleStyle.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
          No activity yet
        </div>
      )}
    </div>
  );
}
