'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Flame, Clock, Footprints, Heart, Moon, Target, Edit, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { MOCK_ACTIVITY_DATA, MOCK_USERS } from '@/lib/mockData';
import { useToast } from '@/lib/Toast';
import Modal from '@/lib/Modal';

export default function CaregiverActivityPage() {
  const { addToast } = useToast();
  const patient = MOCK_USERS.patient;
  const [view, setView] = useState('week');
  const [showGoalEdit, setShowGoalEdit] = useState(false);
  const [goals, setGoals] = useState({ steps: 5000, active: 45, sleep: 8 });
  const [editGoals, setEditGoals] = useState({ steps: 5000, active: 45, sleep: 8 });

  const todaySteps = 3200;
  const todayCalories = 185;
  const todayActive = 48;
  const todaySleep = 7.5;

  const sleepData = [
    { day: 'Mon', hours: 7.5 },
    { day: 'Tue', hours: 6.8 },
    { day: 'Wed', hours: 8.0 },
    { day: 'Thu', hours: 7.2 },
    { day: 'Fri', hours: 7.0 },
    { day: 'Sat', hours: 8.5 },
    { day: 'Sun', hours: 7.5 },
  ];

  const heartRateZones = [
    { zone: 'Resting', min: 62, max: 72, time: '18h', color: 'var(--accent-teal)', pct: 75 },
    { zone: 'Light', min: 72, max: 90, time: '4h', color: 'var(--accent-emerald)', pct: 16.7 },
    { zone: 'Moderate', min: 90, max: 110, time: '1.5h', color: 'var(--accent-amber)', pct: 6.3 },
    { zone: 'Elevated', min: 110, max: 130, time: '0.5h', color: 'var(--accent-rose)', pct: 2 },
  ];

  const handleSaveGoals = () => {
    setGoals(editGoals);
    setShowGoalEdit(false);
    addToast('✅ Activity goals updated successfully', 'success');
  };

  const stepsProgress = Math.min((todaySteps / goals.steps) * 100, 100);
  const activeProgress = Math.min((todayActive / goals.active) * 100, 100);
  const sleepProgress = Math.min((todaySleep / goals.sleep) * 100, 100);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Activity Monitor</h1>
            <p className="page-description">Activity & wellness tracking for {patient.name}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.97 }} onClick={() => { setEditGoals(goals); setShowGoalEdit(true); }}>
              <Target size={16} /> Edit Goals
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card teal">
          <div className="stat-icon teal"><Footprints size={22} /></div>
          <div className="stat-value">{todaySteps.toLocaleString()}</div>
          <div className="stat-label">Steps Today</div>
          <div className="progress-bar" style={{ marginTop: '8px' }}>
            <motion.div className="progress-fill teal" initial={{ width: 0 }} animate={{ width: `${stepsProgress}%` }} transition={{ duration: 1, delay: 0.2 }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: stepsProgress >= 100 ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: stepsProgress >= 100 ? 600 : 400 }}>
            {stepsProgress >= 100 ? '🎉 Goal reached!' : `Goal: ${goals.steps.toLocaleString()} steps`}
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Flame size={22} /></div>
          <div className="stat-value">{todayCalories}</div>
          <div className="stat-label">Calories Burned</div>
          <div className="stat-trend up"><TrendingUp size={12} /> +12%</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple"><Clock size={22} /></div>
          <div className="stat-value">{todayActive}m</div>
          <div className="stat-label">Active Minutes</div>
          <div className="progress-bar" style={{ marginTop: '8px' }}>
            <motion.div className="progress-fill purple" initial={{ width: 0 }} animate={{ width: `${activeProgress}%` }} transition={{ duration: 1, delay: 0.4 }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: activeProgress >= 100 ? 'var(--accent-emerald)' : 'var(--text-muted)', fontWeight: activeProgress >= 100 ? 600 : 400 }}>
            {activeProgress >= 100 ? '🎉 Goal reached!' : `Goal: ${goals.active} min`}
          </div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon rose"><Moon size={22} /></div>
          <div className="stat-value">{todaySleep}h</div>
          <div className="stat-label">Sleep Last Night</div>
          <div className="progress-bar" style={{ marginTop: '8px' }}>
            <motion.div className="progress-fill rose" initial={{ width: 0 }} animate={{ width: `${sleepProgress}%` }} transition={{ duration: 1, delay: 0.6 }} />
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Goal: {goals.sleep}h</div>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="pill-tabs" style={{ marginBottom: '24px' }}>
        {['day', 'week', 'month'].map(p => (
          <button key={p} className={`pill-tab ${view === p ? 'active' : ''}`} onClick={() => { setView(p); addToast(`Showing ${p}ly data`, 'info'); }}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid-2">
        {/* Steps Chart */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Weekly Steps</h2>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ACTIVITY_DATA}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }}
                  formatter={(v) => [`${v.toLocaleString()} steps`]}
                />
                <Bar dataKey="steps" radius={[8, 8, 0, 0]} fill="#2DD4BF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Weekly avg: {Math.round(MOCK_ACTIVITY_DATA.reduce((a, d) => a + d.steps, 0) / 7).toLocaleString()} steps/day
            {Math.round(MOCK_ACTIVITY_DATA.reduce((a, d) => a + d.steps, 0) / 7) >= goals.steps && <span style={{ color: 'var(--accent-emerald)', marginLeft: '8px' }}>✓ On target</span>}
          </div>
        </div>

        {/* Active Minutes */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Active Minutes</h2>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ACTIVITY_DATA}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }}
                  formatter={(v) => [`${v} min`]}
                />
                <Bar dataKey="active" radius={[8, 8, 0, 0]} fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Target: {goals.active} min/day • Weekly avg: {Math.round(MOCK_ACTIVITY_DATA.reduce((a, d) => a + d.active, 0) / 7)} min
          </div>
        </div>

        {/* Sleep */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Sleep Pattern</h2>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sleepData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis hide domain={[5, 10]} />
                <Tooltip
                  contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }}
                  formatter={(v) => [`${v} hours`]}
                />
                <defs>
                  <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="hours" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#sleepGrad)" dot={{ fill: '#8B5CF6', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', marginTop: '12px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Avg: {(sleepData.reduce((a, d) => a + d.hours, 0) / 7).toFixed(1)} hours • Target: {goals.sleep} hours
          </div>
        </div>

        {/* Heart Rate Zones */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Heart Rate Zones (24h)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {heartRateZones.map((z, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{z.zone}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{z.min}-{z.max} bpm • {z.time}</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${z.pct}%` }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                    style={{
                      height: '100%', borderRadius: 'var(--border-radius-full)',
                      background: z.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px', padding: '14px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
            <Heart size={18} style={{ color: 'var(--accent-rose)', marginBottom: '4px' }} />
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Resting HR: 68 bpm</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Normal range for age 73</div>
          </div>
        </div>
      </div>

      {/* Goal Edit Modal */}
      <Modal isOpen={showGoalEdit} onClose={() => setShowGoalEdit(false)} title="Edit Activity Goals" subtitle={`Customize targets for ${patient.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label className="input-label" style={{ marginBottom: '10px', display: 'block' }}>
              Daily Steps Goal: <strong style={{ color: 'var(--accent-teal)' }}>{editGoals.steps.toLocaleString()}</strong>
            </label>
            <input
              type="range" min={1000} max={10000} step={500}
              value={editGoals.steps}
              onChange={(e) => setEditGoals(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
              style={{ width: '100%', accentColor: 'var(--accent-teal)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              <span>1,000</span>
              <span>10,000</span>
            </div>
          </div>

          <div>
            <label className="input-label" style={{ marginBottom: '10px', display: 'block' }}>
              Active Minutes Goal: <strong style={{ color: 'var(--accent-purple)' }}>{editGoals.active} min</strong>
            </label>
            <input
              type="range" min={15} max={120} step={5}
              value={editGoals.active}
              onChange={(e) => setEditGoals(prev => ({ ...prev, active: parseInt(e.target.value) }))}
              style={{ width: '100%', accentColor: 'var(--accent-purple)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              <span>15 min</span>
              <span>120 min</span>
            </div>
          </div>

          <div>
            <label className="input-label" style={{ marginBottom: '10px', display: 'block' }}>
              Sleep Target: <strong style={{ color: 'var(--accent-rose)' }}>{editGoals.sleep}h</strong>
            </label>
            <input
              type="range" min={5} max={10} step={0.5}
              value={editGoals.sleep}
              onChange={(e) => setEditGoals(prev => ({ ...prev, sleep: parseFloat(e.target.value) }))}
              style={{ width: '100%', accentColor: 'var(--accent-rose)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              <span>5h</span>
              <span>10h</span>
            </div>
          </div>

          <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={handleSaveGoals} style={{ width: '100%' }}>
            <CheckCircle2 size={18} /> Save Goals
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}
