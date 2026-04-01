'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Pill, Heart, Activity, Droplets, Thermometer, Scale,
  MessageCircle, AlertTriangle, MapPin, UtensilsCrossed,
  Calendar, TrendingUp, TrendingDown, Minus, Clock,
  ChevronRight, CheckCircle2, XCircle, Sun
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  MOCK_USERS, MOCK_MEDICATIONS, MOCK_MED_LOGS, MOCK_VITALS,
  MOCK_ADHERENCE_WEEKLY, MOCK_APPOINTMENTS, MOCK_ALERTS,
  MOCK_WELLNESS_CHECKIN, MOCK_HYDRATION, getGreeting, getCurrentDate
} from '@/lib/mockData';

export default function DashboardPage() {
  const user = MOCK_USERS.patient;
  const pendingMeds = MOCK_MED_LOGS.filter(l => l.status === 'pending');
  const takenMeds = MOCK_MED_LOGS.filter(l => l.status === 'taken');

  const vitalsCards = [
    { label: 'Heart Rate', value: MOCK_VITALS.heartRate.current, unit: 'bpm', icon: Heart, color: 'rose', trend: 'stable' },
    { label: 'Blood Sugar', value: MOCK_VITALS.bloodSugar.current, unit: 'mg/dL', icon: Activity, color: 'amber', trend: 'improving' },
    { label: 'SpO2', value: MOCK_VITALS.spo2.current, unit: '%', icon: Droplets, color: 'teal', trend: 'stable' },
    { label: 'Blood Pressure', value: MOCK_VITALS.bloodPressure.current, unit: 'mmHg', icon: TrendingUp, color: 'purple', trend: 'stable' },
  ];

  const trendIcon = (trend) => {
    if (trend === 'improving') return <TrendingDown size={14} />;
    if (trend === 'declining') return <TrendingUp size={14} />;
    return <Minus size={14} />;
  };

  return (
    <div className="fade-in">
      {/* Welcome Section */}
      <div style={{ marginBottom: '32px' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
            {getGreeting()}, {user.name.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            {getCurrentDate()}  •  Here's your health summary for today
          </p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions" style={{ marginBottom: '32px' }}>
        {[
          { href: '/dashboard/chat', icon: MessageCircle, label: 'AI Chat', color: 'var(--accent-teal)', bg: 'var(--accent-teal-soft)' },
          { href: '/dashboard/emergency', icon: AlertTriangle, label: 'SOS', color: 'var(--accent-rose)', bg: 'var(--accent-rose-soft)' },
          { href: '/dashboard/medications', icon: Pill, label: 'Medications', color: 'var(--primary-soft)', bg: 'var(--primary-glow)' },
          { href: '/dashboard/diet', icon: UtensilsCrossed, label: 'Diet Plan', color: 'var(--accent-amber)', bg: 'var(--accent-amber-soft)' },
          { href: '/dashboard/location', icon: MapPin, label: 'Location', color: 'var(--accent-emerald)', bg: 'var(--accent-emerald-soft)' },
          { href: '/dashboard/appointments', icon: Calendar, label: 'Appointments', color: 'var(--accent-purple)', bg: 'var(--accent-purple-soft)' },
        ].map((action, i) => (
          <Link key={i} href={action.href} className="quick-action">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="quick-action-icon"
              style={{ background: action.bg, color: action.color }}
            >
              <action.icon size={26} />
            </motion.div>
            <span className="quick-action-label">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid-2">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Vitals Grid */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="card-title">Today's Vitals</h2>
              <span className="badge badge-success"><Sun size={12} /> Updated</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {vitalsCards.map((v, i) => (
                <motion.div
                  key={i}
                  className={`stat-card ${v.color}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ padding: '18px' }}
                >
                  <div className={`stat-icon ${v.color}`}>
                    <v.icon size={22} />
                  </div>
                  <div className="stat-value" style={{ fontSize: 'var(--font-size-xl)' }}>{v.value}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="stat-label" style={{ fontSize: 'var(--font-size-xs)' }}>{v.label}</span>
                    <span className={`stat-trend ${v.trend === 'improving' ? 'up' : ''}`} style={{ fontSize: '0.7rem' }}>
                      {trendIcon(v.trend)} {v.unit}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Medication Adherence Chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title">Weekly Adherence</h2>
              <Link href="/dashboard/medications" style={{ color: 'var(--primary-soft)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_ADHERENCE_WEEKLY}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }}
                    formatter={(value) => [`${value}%`, 'Adherence']}
                  />
                  <Bar dataKey="adherence" radius={[6, 6, 0, 0]} fill="url(#adherenceGradient)" />
                  <defs>
                    <linearGradient id="adherenceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4F6BFF" />
                      <stop offset="100%" stopColor="#3A51CC" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '8px' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--primary)' }} />
                Medication Adherence %
              </span>
            </div>
          </div>

          {/* Wellness Check-in */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '16px' }}>Today's Wellness</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { label: 'Sleep', value: `${MOCK_WELLNESS_CHECKIN.sleep.hours}h`, emoji: '😴', sub: MOCK_WELLNESS_CHECKIN.sleep.label },
                { label: 'Pain', value: `${MOCK_WELLNESS_CHECKIN.pain.score}/10`, emoji: '💪', sub: MOCK_WELLNESS_CHECKIN.pain.label },
                { label: 'Mood', value: `${MOCK_WELLNESS_CHECKIN.mood.score}/10`, emoji: '😊', sub: MOCK_WELLNESS_CHECKIN.mood.label },
              ].map((w, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{w.emoji}</div>
                  <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{w.value}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{w.label} — {w.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Today's Medications */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title">Today's Medications</h2>
              <span className="badge badge-info">{takenMeds.length}/{MOCK_MED_LOGS.length} done</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {MOCK_MED_LOGS.map((log) => {
                const med = MOCK_MEDICATIONS.find(m => m.id === log.medId);
                if (!med) return null;
                return (
                  <div key={log.id} className="med-card">
                    <div className={`med-icon`} style={{
                      background: log.status === 'taken' ? 'var(--accent-emerald-soft)' : 'var(--accent-amber-soft)',
                      color: log.status === 'taken' ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                    }}>
                      {log.status === 'taken' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                    </div>
                    <div className="med-info">
                      <div className="med-name">{med.name} {med.dosage}</div>
                      <div className="med-schedule">
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        {log.time} • {med.instructions}
                      </div>
                    </div>
                    <div className="med-status">
                      <span className={`badge ${log.status === 'taken' ? 'badge-success' : 'badge-warning'}`}>
                        {log.status === 'taken' ? 'Taken ✓' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Link href="/dashboard/medications">
              <motion.button
                className="btn btn-ghost w-full mt-md"
                whileTap={{ scale: 0.98 }}
                style={{ width: '100%', marginTop: '16px' }}
              >
                View All Medications <ChevronRight size={16} />
              </motion.button>
            </Link>
          </div>

          {/* Hydration */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title">Hydration</h2>
              <span className="badge badge-info">{MOCK_HYDRATION.current}/{MOCK_HYDRATION.target} glasses</span>
            </div>
            <div className="progress-bar" style={{ marginBottom: '12px' }}>
              <div className="progress-fill teal" style={{ width: `${(MOCK_HYDRATION.current / MOCK_HYDRATION.target) * 100}%` }} />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Array.from({ length: MOCK_HYDRATION.target }).map((_, i) => (
                <div key={i} style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: i < MOCK_HYDRATION.current ? 'var(--accent-teal-soft)' : 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem'
                }}>
                  {i < MOCK_HYDRATION.current ? '💧' : '○'}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title">Upcoming Appointments</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {MOCK_APPOINTMENTS.map((apt) => (
                <div key={apt.id} style={{
                  padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{apt.doctor}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {apt.specialty} • {apt.date}, {apt.time}
                    </div>
                  </div>
                  <span className={`badge ${apt.status === 'upcoming' ? 'badge-success' : 'badge-info'}`}>
                    {apt.type === 'video' ? '📹' : '🏥'} {apt.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '16px' }}>Recent Alerts</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {MOCK_ALERTS.slice(0, 3).map((alert) => (
                <div key={alert.id} style={{
                  padding: '12px 16px', borderLeft: `3px solid ${alert.severity === 'danger' ? 'var(--accent-rose)' : alert.severity === 'warning' ? 'var(--accent-amber)' : 'var(--primary-soft)'}`,
                  background: 'var(--bg-elevated)', borderRadius: '0 var(--border-radius-sm) var(--border-radius-sm) 0'
                }}>
                  <div style={{ fontSize: 'var(--font-size-sm)' }}>{alert.message}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>{alert.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
