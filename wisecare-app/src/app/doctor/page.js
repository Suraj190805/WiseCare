'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, Calendar, AlertTriangle, Heart, Activity,
  TrendingDown, ChevronRight, Video, Eye, FileText,
  Watch, Bluetooth, Droplets, Thermometer, Footprints
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { MOCK_USERS, getGreeting, getCurrentDate } from '@/lib/mockData';
import { useSharedData } from '@/lib/SharedDataStore';
import ActivityFeed from '@/lib/ActivityFeed';

export default function DoctorDashboardPage() {
  const user = MOCK_USERS.doctor;
  const { vitals, appointments, adherenceRate, alerts, unreadAlertCount, medications, doctorNotes } = useSharedData();
  const [selectedPatient, setSelectedPatient] = useState(0);

  const upcomingApts = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled');

  const patientsList = [
    { id: 'p1', name: 'Rajan Kumar', age: 73, conditions: ['Type 2 Diabetes', 'Hypertension'], risk: 'moderate', adherence: adherenceRate, avatar: 'RK', isLive: true },
    { id: 'p2', name: 'Sunita Devi', age: 68, conditions: ['Hypertension', 'Arthritis'], risk: 'low', adherence: 92, avatar: 'SD' },
    { id: 'p3', name: 'Mohan Lal', age: 79, conditions: ['COPD', 'Diabetes'], risk: 'high', adherence: 65, avatar: 'ML' },
    { id: 'p4', name: 'Kamala Rao', age: 71, conditions: ['Heart Disease'], risk: 'moderate', adherence: 78, avatar: 'KR' },
  ];

  const riskColor = (risk) => risk === 'high' ? 'var(--accent-rose)' : risk === 'moderate' ? 'var(--accent-amber)' : 'var(--accent-emerald)';

  const vitalsHistory = (vitals.heartRate?.history || [74, 71, 73, 72, 75, 71, 72]).map((hr, i) => ({
    day: `Day ${i + 1}`,
    heartRate: hr,
    bloodSugar: (vitals.bloodSugar?.history || [165, 158, 150, 148, 145, 143, 142])[i],
  }));

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
          {getGreeting()}, {user.name} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {getCurrentDate()} • {patientsList.length} patients under care — Live Data 🟢
        </p>
      </div>

      {/* Stats — LIVE */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card primary">
          <div className="stat-icon primary"><Users size={22} /></div>
          <div className="stat-value">{patientsList.length}</div>
          <div className="stat-label">Total Patients</div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon teal"><Calendar size={22} /></div>
          <div className="stat-value">{upcomingApts.filter(a => a.date === 'Today' || a.status === 'upcoming').length}</div>
          <div className="stat-label">Consults Today</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><AlertTriangle size={22} /></div>
          <div className="stat-value">{unreadAlertCount}</div>
          <div className="stat-label">Active Alerts</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon rose"><Heart size={22} /></div>
          <div className="stat-value">{patientsList.filter(p => p.risk === 'high').length}</div>
          <div className="stat-label">High Risk Patients</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Patient Overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="card-title">Patient Overview</h2>
            <Link href="/doctor/patients">
              <span className="badge badge-info">{patientsList.length} patients</span>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {patientsList.map((p, i) => (
              <motion.div
                key={p.id}
                onClick={() => setSelectedPatient(i)}
                whileHover={{ scale: 1.01 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 16px',
                  background: selectedPatient === i ? 'rgba(79, 107, 255, 0.06)' : 'var(--bg-elevated)',
                  border: selectedPatient === i ? '1px solid var(--border-accent)' : '1px solid transparent',
                  borderRadius: 'var(--border-radius-sm)', cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${riskColor(p.risk)}, var(--primary))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700
                  }}>
                    {p.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {p.name}, {p.age}
                      {p.isLive && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{p.conditions.join(', ')}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge" style={{ background: `${riskColor(p.risk)}18`, color: riskColor(p.risk), fontSize: '0.7rem' }}>
                    {p.risk} risk
                  </span>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Adherence: {p.adherence}%{p.isLive ? ' 🟢' : ''}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vitals Chart — LIVE */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '4px' }}>{patientsList[selectedPatient].name} — Vitals (7 days)</h2>
          <p className="card-subtitle" style={{ marginBottom: '16px' }}>
            Heart Rate & Blood Sugar trends{patientsList[selectedPatient].isLive ? ' • Live 🟢' : ''}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Heart Rate', value: `${vitals.heartRate?.current || 72} bpm`, status: 'Normal', color: 'var(--accent-rose)' },
              { label: 'Blood Pressure', value: vitals.bloodPressure?.current || '128/82', status: 'Borderline', color: 'var(--accent-amber)' },
              { label: 'Blood Sugar', value: `${vitals.bloodSugar?.current || 142} mg/dL`, status: 'Above Target', color: 'var(--accent-amber)' },
              { label: 'SpO2', value: `${vitals.spo2?.current || 97}%`, status: 'Normal', color: 'var(--accent-emerald)' },
            ].map((v, j) => (
              <div key={j} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{v.label}</div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{v.value}</div>
                <span className="badge" style={{ background: `${v.color}18`, color: v.color, fontSize: '0.65rem' }}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>

          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitalsHistory}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }} />
                <Line type="monotone" dataKey="heartRate" stroke="#F43F5E" strokeWidth={2} dot={{ r: 3 }} name="Heart Rate" />
                <Line type="monotone" dataKey="bloodSugar" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} name="Blood Sugar" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments — LIVE */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="card-title">Upcoming Appointments</h2>
            <Link href="/doctor/appointments" style={{ color: 'var(--primary-soft)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingApts.slice(0, 4).map((apt) => (
              <div key={apt.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', background: 'var(--bg-elevated)',
                borderRadius: 'var(--border-radius-sm)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{apt.patient || apt.doctor || 'Rajan Kumar'}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{apt.date} at {apt.time}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className={`badge ${apt.type === 'video' ? 'badge-info' : 'badge-success'}`}>
                    {apt.type === 'video' ? '📹 Video' : '🏥 In-person'}
                  </span>
                  {apt.source === 'patient' && <span className="badge" style={{ fontSize: '0.55rem', background: 'rgba(45,212,191,0.1)', color: 'var(--accent-teal)' }}>🧑 Patient</span>}
                  {apt.type === 'video' && (apt.status === 'upcoming' || apt.status === 'scheduled') && (
                    <Link href="/doctor/appointments">
                      <motion.button className="btn btn-primary btn-sm" whileTap={{ scale: 0.95 }} style={{ padding: '6px 12px', minHeight: 'unset' }}>
                        <Video size={14} /> Join
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {upcomingApts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No upcoming appointments</div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <ActivityFeed maxItems={8} showFilter={true} />

        {/* Patient Wearable Vitals */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Watch size={18} style={{ color: 'var(--accent-teal)' }} /> Patient Wearable Vitals
            </h2>
            <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Bluetooth size={10} />
              {vitals.heartRate?.source === 'wearable' ? '🟢 Live' : '⏸ No Device'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              {
                label: 'Heart Rate',
                value: vitals.heartRate?.source === 'wearable' ? `${vitals.heartRate.current} bpm` : '— bpm',
                icon: Heart,
                color: '#F43F5E',
                source: vitals.heartRate?.source,
                status: vitals.heartRate?.current >= 60 && vitals.heartRate?.current <= 100 ? 'Normal' : 'Check'
              },
              {
                label: 'SpO₂',
                value: vitals.spo2?.source === 'wearable' ? `${vitals.spo2.current}%` : `${vitals.spo2?.current || 97}%`,
                icon: Droplets,
                color: '#2DD4BF',
                source: vitals.spo2?.source,
                status: (vitals.spo2?.current || 97) >= 95 ? 'Normal' : 'Low'
              },
              {
                label: 'Temperature',
                value: vitals.temperature?.source === 'wearable' ? `${vitals.temperature.current}°F` : '—°F',
                icon: Thermometer,
                color: '#F59E0B',
                source: vitals.temperature?.source,
                status: vitals.temperature?.current >= 97.8 && vitals.temperature?.current <= 99.1 ? 'Normal' : 'Check'
              },
              {
                label: 'Blood Pressure',
                value: vitals.bloodPressure?.source === 'wearable' ? vitals.bloodPressure.current : vitals.bloodPressure?.current || '—',
                icon: Activity,
                color: '#A855F7',
                source: vitals.bloodPressure?.source,
                status: 'Monitor'
              },
            ].map((v, i) => (
              <div key={i} style={{
                padding: '14px 16px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--border-radius-sm)',
                borderLeft: v.source === 'wearable' ? `3px solid ${v.color}` : '3px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <v.icon size={16} style={{ color: v.color }} />
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{v.label}</span>
                  </div>
                  {v.source === 'wearable' && (
                    <span style={{ fontSize: '0.55rem', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Watch size={8} /> Wearable
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{v.value}</div>
                <span className="badge" style={{ background: `${v.status === 'Normal' ? 'var(--accent-emerald)' : 'var(--accent-amber)'}18`, color: v.status === 'Normal' ? 'var(--accent-emerald)' : 'var(--accent-amber)', fontSize: '0.6rem', marginTop: '4px' }}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
          {vitals.heartRate?.source !== 'wearable' && (
            <div style={{
              marginTop: '14px', padding: '12px 16px',
              background: 'rgba(79, 107, 255, 0.05)',
              border: '1px solid rgba(79, 107, 255, 0.15)',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <Watch size={14} style={{ color: 'var(--primary-soft)' }} />
              Patient has not connected a wearable device yet. Wearable data will appear here automatically once connected.
            </div>
          )}
        </div>

        {/* Drug Interactions */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="card-title">Drug Interaction Flags</h2>
            <Link href="/doctor/interactions">
              <span className="badge badge-danger">2 active</span>
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { drugs: 'Metformin + Atorvastatin', risk: 'Low', note: 'Minor interaction — monitor liver function', color: 'var(--accent-amber)' },
              { drugs: 'Aspirin + Amlodipine', risk: 'Moderate', note: 'May reduce antihypertensive effect — monitor BP regularly', color: 'var(--accent-rose)' },
            ].map((inter, i) => (
              <div key={i} style={{
                padding: '14px 16px',
                borderLeft: `4px solid ${inter.color}`,
                background: 'var(--bg-elevated)',
                borderRadius: '0 var(--border-radius-sm) var(--border-radius-sm) 0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{inter.drugs}</div>
                  <span className="badge" style={{ background: `${inter.color}18`, color: inter.color, fontSize: '0.65rem' }}>
                    {inter.risk} Risk
                  </span>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{inter.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
