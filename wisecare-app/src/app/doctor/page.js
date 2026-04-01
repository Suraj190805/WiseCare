'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, Calendar, AlertTriangle, Heart, Activity,
  TrendingDown, ChevronRight, Video, Eye, FileText
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import {
  MOCK_USERS, MOCK_VITALS, MOCK_APPOINTMENTS, getGreeting, getCurrentDate
} from '@/lib/mockData';

export default function DoctorDashboardPage() {
  const user = MOCK_USERS.doctor;
  const [selectedPatient, setSelectedPatient] = useState(0);

  const patientsList = [
    { id: 'p1', name: 'Rajan Kumar', age: 73, conditions: ['Type 2 Diabetes', 'Hypertension'], risk: 'moderate', adherence: 87, avatar: 'RK' },
    { id: 'p2', name: 'Sunita Devi', age: 68, conditions: ['Hypertension', 'Arthritis'], risk: 'low', adherence: 92, avatar: 'SD' },
    { id: 'p3', name: 'Mohan Lal', age: 79, conditions: ['COPD', 'Diabetes'], risk: 'high', adherence: 65, avatar: 'ML' },
    { id: 'p4', name: 'Kamala Rao', age: 71, conditions: ['Heart Disease'], risk: 'moderate', adherence: 78, avatar: 'KR' },
  ];

  const riskColor = (risk) => risk === 'high' ? 'var(--accent-rose)' : risk === 'moderate' ? 'var(--accent-amber)' : 'var(--accent-emerald)';

  const vitalsHistory = MOCK_VITALS.heartRate.history.map((hr, i) => ({
    day: `Day ${i + 1}`,
    heartRate: hr,
    bloodSugar: MOCK_VITALS.bloodSugar.history[i],
  }));

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
          {getGreeting()}, {user.name} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {getCurrentDate()} • {patientsList.length} patients under care
        </p>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card primary">
          <div className="stat-icon primary"><Users size={22} /></div>
          <div className="stat-value">{patientsList.length}</div>
          <div className="stat-label">Total Patients</div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon teal"><Calendar size={22} /></div>
          <div className="stat-value">1</div>
          <div className="stat-label">Consult Today</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><AlertTriangle size={22} /></div>
          <div className="stat-value">2</div>
          <div className="stat-label">Drug Interaction Flags</div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon rose"><Heart size={22} /></div>
          <div className="stat-value">1</div>
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
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{p.name}, {p.age}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{p.conditions.join(', ')}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge" style={{
                    background: `${riskColor(p.risk)}18`, color: riskColor(p.risk), fontSize: '0.7rem'
                  }}>
                    {p.risk} risk
                  </span>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Adherence: {p.adherence}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vitals Chart */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '4px' }}>{patientsList[selectedPatient].name} — Vitals (7 days)</h2>
          <p className="card-subtitle" style={{ marginBottom: '16px' }}>Heart Rate & Blood Sugar trends</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Heart Rate', value: `${MOCK_VITALS.heartRate.current} bpm`, status: 'Normal', color: 'var(--accent-rose)' },
              { label: 'Blood Pressure', value: MOCK_VITALS.bloodPressure.current, status: 'Borderline', color: 'var(--accent-amber)' },
              { label: 'Blood Sugar', value: `${MOCK_VITALS.bloodSugar.current} mg/dL`, status: 'Above Target', color: 'var(--accent-amber)' },
              { label: 'SpO2', value: `${MOCK_VITALS.spo2.current}%`, status: 'Normal', color: 'var(--accent-emerald)' },
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

        {/* Appointments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="card-title">Today's Appointments</h2>
            <Link href="/doctor/appointments" style={{ color: 'var(--primary-soft)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {MOCK_APPOINTMENTS.map((apt) => (
              <div key={apt.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', background: 'var(--bg-elevated)',
                borderRadius: 'var(--border-radius-sm)'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Rajan Kumar</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{apt.date} at {apt.time}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span className={`badge ${apt.type === 'video' ? 'badge-info' : 'badge-success'}`}>
                    {apt.type === 'video' ? '📹 Video' : '🏥 In-person'}
                  </span>
                  {apt.type === 'video' && apt.status === 'upcoming' && (
                    <motion.button className="btn btn-primary btn-sm" whileTap={{ scale: 0.95 }} style={{ padding: '6px 12px', minHeight: 'unset' }}>
                      <Video size={14} /> Join
                    </motion.button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drug Interactions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="card-title">Drug Interaction Flags</h2>
            <Link href="/doctor/interactions">
              <span className="badge badge-danger">2 active</span>
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
