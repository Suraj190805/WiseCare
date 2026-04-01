'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart, Activity, CheckCircle2, TrendingUp, TrendingDown,
  Minus, MapPin, ChevronRight, Eye, Phone, Clock, AlertTriangle
} from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  MOCK_USERS, MOCK_ADHERENCE_WEEKLY, MOCK_ACTIVITY_DATA,
  MOCK_LOCATION_HISTORY, getGreeting, getCurrentDate
} from '@/lib/mockData';
import { useSharedData } from '@/lib/SharedDataStore';
import ActivityFeed from '@/lib/ActivityFeed';

export default function CaregiverDashboardPage() {
  const user = MOCK_USERS.caregiver;
  const patient = MOCK_USERS.patient;
  const { vitals, medLogs, medications, alerts, adherenceRate, unreadAlertCount } = useSharedData();

  const takenToday = medLogs.filter(l => l.status === 'taken').length;
  const pendingToday = medLogs.filter(l => l.status === 'pending').length;

  return (
    <div className="fade-in">
      {/* Welcome */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
          {getGreeting()}, {user.name.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {getCurrentDate()} • Monitoring {patient.name} — Live Data 🟢
        </p>
      </div>

      {/* Patient Card */}
      <motion.div
        className="card-glow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--accent-teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 700
          }}>
            {patient.avatar}
          </div>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{patient.name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              Age {patient.age} • {patient.conditions.join(', ')}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <span className="badge badge-success">🟢 Active</span>
              <span className="badge badge-info">🏠 At Home</span>
              <span className="badge" style={{ background: 'rgba(79,107,255,0.1)', color: 'var(--primary-soft)', fontSize: '0.65rem' }}>Adherence: {adherenceRate}%</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/caregiver/patients">
            <motion.button className="btn btn-primary btn-sm" whileTap={{ scale: 0.95 }}>
              <Eye size={16} /> View Details
            </motion.button>
          </Link>
          <Link href="/caregiver/location">
            <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.95 }}>
              <MapPin size={16} /> Track Location
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stats — LIVE */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card rose">
          <div className="stat-icon rose"><Heart size={22} /></div>
          <div className="stat-value">{vitals.heartRate?.current || 72}</div>
          <div className="stat-label">Heart Rate (bpm)</div>
          <div className="stat-trend up"><Minus size={12} /> {vitals.heartRate?.trend || 'Stable'}</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Activity size={22} /></div>
          <div className="stat-value">{vitals.bloodSugar?.current || 142}</div>
          <div className="stat-label">Blood Sugar (mg/dL)</div>
          <div className="stat-trend up"><TrendingDown size={12} /> {vitals.bloodSugar?.trend || 'Improving'}</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="stat-value">{adherenceRate}%</div>
          <div className="stat-label">Med Adherence</div>
          <div className="stat-trend up"><TrendingUp size={12} /> Live</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon purple"><Activity size={22} /></div>
          <div className="stat-value">3.2K</div>
          <div className="stat-label">Steps Today</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Blood Sugar Trend */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '16px' }}>Blood Sugar Trend (7 days)</h2>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={(vitals.bloodSugar?.history || [165, 158, 150, 148, 145, 143, 142]).map((v, i) => ({ day: `Day ${i + 1}`, value: v }))}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis hide domain={[120, 170]} />
                  <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }} />
                  <defs>
                    <linearGradient id="bsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2.5} fill="url(#bsGrad)" dot={{ fill: '#F59E0B', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Medication Adherence */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title">Medication Adherence</h2>
              <Link href="/caregiver/medications" style={{ color: 'var(--primary-soft)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ChevronRight size={16} />
              </Link>
            </div>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_ADHERENCE_WEEKLY}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }} formatter={(v) => [`${v}%`]} />
                  <Bar dataKey="adherence" radius={[6, 6, 0, 0]} fill="#4F6BFF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Feed */}
          <ActivityFeed maxItems={8} showFilter={true} />
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Alerts — LIVE */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title">Recent Alerts</h2>
              <Link href="/caregiver/alerts">
                <span className="badge badge-danger">{unreadAlertCount} new</span>
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} style={{
                  padding: '14px 16px',
                  borderLeft: `3px solid ${alert.severity === 'danger' ? 'var(--accent-rose)' : alert.severity === 'warning' ? 'var(--accent-amber)' : 'var(--primary-soft)'}`,
                  background: !alert.read ? 'rgba(79, 107, 255, 0.05)' : 'var(--bg-elevated)',
                  borderRadius: '0 var(--border-radius-sm) var(--border-radius-sm) 0'
                }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: !alert.read ? 600 : 400 }}>{alert.message}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{alert.time}</span>
                    {alert.source && alert.source !== 'system' && (
                      <span className="badge" style={{ fontSize: '0.55rem', background: 'rgba(79,107,255,0.1)', color: 'var(--primary-soft)' }}>
                        {alert.source}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's meds — LIVE */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title">Today's Medications</h2>
              <Link href="/caregiver/medications" style={{ color: 'var(--primary-soft)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Details <ChevronRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {medLogs.map((log) => {
                const med = medications.find(m => m.id === log.medId);
                if (!med) return null;
                return (
                  <div key={log.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: 'var(--bg-elevated)',
                    borderRadius: 'var(--border-radius-sm)'
                  }}>
                    <div>
                      <span style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{med.name} {med.dosage}</span>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: '8px' }}>{log.time}</span>
                    </div>
                    <span className={`badge ${log.status === 'taken' ? 'badge-success' : log.status === 'skipped' ? 'badge-danger' : 'badge-warning'}`}>
                      {log.status === 'taken' ? '✓ Taken' : log.status === 'skipped' ? '✗ Skipped' : '⏳ Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title">Location History</h2>
              <Link href="/caregiver/location" style={{ color: 'var(--primary-soft)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Track <ChevronRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {MOCK_LOCATION_HISTORY.slice(0, 4).map((loc, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', background: 'var(--bg-elevated)',
                  borderRadius: 'var(--border-radius-sm)'
                }}>
                  <MapPin size={14} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{loc.place}</div>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{loc.time}</span>
                  <span className={`badge ${loc.zone === 'safe' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                    {loc.zone === 'safe' ? '✓' : '⚠'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
