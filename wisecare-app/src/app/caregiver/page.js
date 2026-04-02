'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Heart, Activity, CheckCircle2, TrendingUp, TrendingDown,
  Minus, MapPin, ChevronRight, Eye, Phone, Clock, AlertTriangle,
  ClipboardCheck, XCircle, BellRing, ShieldAlert, Bell
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
  const { vitals, medLogs, medications, alerts, adherenceRate, unreadAlertCount, todayCheckins, missedCheckins, checkinSchedule, addAlert, addActivity } = useSharedData();
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const [alertSentForSlots, setAlertSentForSlots] = useState([]);
  const [simulatedMissed, setSimulatedMissed] = useState([]);
  const [notificationSent, setNotificationSent] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showNotifToast, setShowNotifToast] = useState(false);

  // Combine real missed + simulated missed check-ins
  const allMissedCheckins = [...missedCheckins, ...simulatedMissed.filter(s => !missedCheckins.some(m => m.id === s.id))];

  // Simulate missed check-ins for demo purposes
  const simulateMissedCheckins = () => {
    const fakeSlots = checkinSchedule.filter(s => !todayCheckins.some(c => c.slotId === s.id) && !simulatedMissed.some(m => m.id === s.id));
    if (fakeSlots.length > 0) {
      setSimulatedMissed(prev => [...prev, ...fakeSlots]);
      setDismissedAlert(false);
      setElapsedTime(0);
      // Trigger browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⚠️ WiseCare Alert', {
          body: `${patient.name} missed ${fakeSlots.length} check-in(s) today! Please verify their wellbeing.`,
          icon: '/favicon.ico',
          tag: 'missed-checkin',
          requireInteraction: true,
        });
      }
      setShowNotifToast(true);
      setTimeout(() => setShowNotifToast(false), 4000);
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Track missed check-ins and auto-create alerts + browser notifications
  useEffect(() => {
    if (allMissedCheckins.length > 0) {
      allMissedCheckins.forEach(slot => {
        if (!alertSentForSlots.includes(slot.id)) {
          addAlert({
            type: 'checkin',
            message: `⚠️ ${patient.name} missed ${slot.label} check-in (${slot.startHour > 12 ? `${slot.startHour - 12} PM` : `${slot.startHour} AM`} – ${slot.endHour > 12 ? `${slot.endHour - 12} PM` : `${slot.endHour} AM`} window). Please verify patient wellbeing.`,
            severity: 'danger',
            source: 'system',
          });
          addActivity({
            type: 'checkin',
            message: `⚠ ${patient.name} missed ${slot.label} check-in — caregiver notified`,
            role: 'system',
            icon: '🚨',
          });
          setAlertSentForSlots(prev => [...prev, slot.id]);
          // Browser push notification
          if ('Notification' in window && Notification.permission === 'granted' && !notificationSent) {
            new Notification('⚠️ WiseCare: Missed Check-In', {
              body: `${patient.name} missed their ${slot.label} check-in. Please reach out to ensure their safety.`,
              icon: '/favicon.ico',
              tag: `missed-${slot.id}`,
              requireInteraction: true,
            });
            setNotificationSent(true);
          }
        }
      });
    }
  }, [allMissedCheckins.length]);

  // Elapsed time counter for urgency
  useEffect(() => {
    if (allMissedCheckins.length === 0) return;
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, [allMissedCheckins.length]);

  const takenToday = medLogs.filter(l => l.status === 'taken').length;
  const pendingToday = medLogs.filter(l => l.status === 'pending').length;

  // Calculate time since first missed check-in
  const getElapsedLabel = () => {
    if (allMissedCheckins.length === 0) return '';
    const firstMissed = allMissedCheckins[0];
    const now = new Date();
    const endHour = firstMissed.endHour;
    const minutesSince = (now.getHours() - endHour) * 60 + now.getMinutes();
    if (minutesSince < 1) return 'Just now';
    if (minutesSince < 60) return `${minutesSince} min ago`;
    return `${Math.floor(minutesSince / 60)}h ${minutesSince % 60}m ago`;
  };

  return (
    <div className="fade-in">
      {/* Notification Toast */}
      {showNotifToast && (
        <motion.div
          initial={{ opacity: 0, y: -30, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'fixed', top: '24px', left: '50%',
            zIndex: 9999,
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            color: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(220, 38, 38, 0.4)',
            fontWeight: 600,
            fontSize: 'var(--font-size-sm)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}
        >
          <Bell size={18} style={{ animation: 'bellShake 0.5s ease-in-out 3' }} />
          🚨 Missed check-in alert triggered for {patient.name}
        </motion.div>
      )}

      {/* Welcome */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>
          {getGreeting()}, {user.name.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {getCurrentDate()} • Monitoring {patient.name} — Live Data 🟢
        </p>
      </div>

      {/* ━━━━━ MISSED CHECK-IN NOTIFICATION BANNER ━━━━━ */}
      {allMissedCheckins.length > 0 && !dismissedAlert && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            marginBottom: '28px',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Animated pulsing border */}
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '20px',
            border: '2px solid rgba(244, 63, 94, 0.5)',
            animation: 'pulseRing 2s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 2,
          }} />

          {/* Gradient shimmer strip at top */}
          <div style={{
            height: '4px',
            background: 'linear-gradient(90deg, #dc2626, #f97316, #dc2626, #f97316)',
            backgroundSize: '200% auto',
            animation: 'shimmer 2s linear infinite',
          }} />

          <div style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.06) 0%, rgba(251, 146, 60, 0.04) 50%, rgba(239, 68, 68, 0.06) 100%)',
          }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              {/* Alert Icon with pulse animation */}
              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(239, 68, 68, 0.1))',
                color: '#ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: '-4px',
                  borderRadius: '20px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
                <ShieldAlert size={28} style={{ position: 'relative', zIndex: 1 }} />
              </div>

              <div style={{ flex: 1 }}>
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '8px', flexWrap: 'wrap', gap: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ef4444' }}>
                      🚨 Missed Check-In Alert
                    </span>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="badge badge-danger"
                      style={{ fontSize: '0.7rem', padding: '4px 10px' }}
                    >
                      {allMissedCheckins.length} of 3 MISSED
                    </motion.span>
                  </div>
                  {allMissedCheckins.length >= 3 && (
                    <motion.span
                      animate={{ opacity: [0.6, 1, 0.6] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        color: '#dc2626', padding: '4px 12px',
                        background: 'rgba(220, 38, 38, 0.1)',
                        borderRadius: '999px',
                        border: '1px solid rgba(220, 38, 38, 0.2)',
                      }}
                    >
                      ⚠ CRITICAL — ALL CHECK-INS MISSED
                    </motion.span>
                  )}
                </div>

                {/* Description */}
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                }}>
                  <strong>{patient.name}</strong> has missed{' '}
                  {allMissedCheckins.length === 1 ? '1 scheduled check-in' :
                   allMissedCheckins.length === 2 ? '2 scheduled check-ins' :
                   'all 3 scheduled check-ins'} today.
                  {allMissedCheckins.length >= 3 && (
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>
                      {' '}Immediate action is recommended to verify patient safety.
                    </span>
                  )}
                  {allMissedCheckins.length < 3 && ' Please verify their wellbeing.'}
                </div>

                {/* Check-in slot status pills */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {checkinSchedule.map((slot) => {
                    const done = todayCheckins.some(c => c.slotId === slot.id);
                    const isMissed = allMissedCheckins.some(m => m.id === slot.id);
                    const currentHour = new Date().getHours();
                    const isActive = currentHour >= slot.startHour && currentHour < slot.endHour;
                    const isUpcoming = currentHour < slot.startHour;
                    return (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: checkinSchedule.indexOf(slot) * 0.1 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 16px',
                          borderRadius: '12px',
                          background: done ? 'rgba(16, 185, 129, 0.1)' : isMissed ? 'rgba(244, 63, 94, 0.1)' : isActive ? 'rgba(79, 107, 255, 0.08)' : 'var(--bg-elevated)',
                          border: `1.5px solid ${done ? 'rgba(16, 185, 129, 0.3)' : isMissed ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-subtle)'}`,
                          fontSize: 'var(--font-size-xs)', fontWeight: 600,
                        }}
                      >
                        {done ? <CheckCircle2 size={15} style={{ color: '#10b981' }} /> :
                         isMissed ? <XCircle size={15} style={{ color: '#ef4444' }} /> :
                         isActive ? <BellRing size={15} style={{ color: 'var(--primary-soft)' }} /> :
                         <Clock size={15} style={{ color: 'var(--text-muted)' }} />}
                        <div>
                          <div style={{ color: done ? '#10b981' : isMissed ? '#ef4444' : 'var(--text-secondary)' }}>
                            {slot.label}
                          </div>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            {slot.startHour > 12 ? `${slot.startHour - 12} PM` : `${slot.startHour} AM`} – {slot.endHour > 12 ? `${slot.endHour - 12} PM` : `${slot.endHour} AM`}
                            {done ? ' ✓ Done' : isMissed ? ' ✗ Missed' : isActive ? ' ⏳ Active' : ' Upcoming'}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Urgency progress bar for 3 missed */}
                {allMissedCheckins.length >= 3 && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px 16px',
                    background: 'rgba(220, 38, 38, 0.06)',
                    borderRadius: '12px',
                    border: '1px solid rgba(220, 38, 38, 0.15)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Urgency Level
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {getElapsedLabel() || 'Just now'}
                      </span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: 'rgba(220, 38, 38, 0.1)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: '33%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #f97316, #ef4444, #dc2626)',
                          borderRadius: '999px',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.6rem', color: '#f97316' }}>Low</span>
                      <span style={{ fontSize: '0.6rem', color: '#ef4444' }}>Medium</span>
                      <span style={{ fontSize: '0.6rem', color: '#dc2626', fontWeight: 700 }}>Critical ●</span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link href="/caregiver/patients">
                    <motion.button
                      className="btn btn-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        gap: '6px',
                        background: allMissedCheckins.length >= 3 ? 'linear-gradient(135deg, #dc2626, #ef4444)' : 'var(--primary)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 600,
                        boxShadow: allMissedCheckins.length >= 3 ? '0 4px 16px rgba(220, 38, 38, 0.3)' : undefined,
                      }}
                    >
                      <Phone size={14} /> Contact {patient.name.split(' ')[0]}
                    </motion.button>
                  </Link>
                  <motion.button
                    className="btn btn-ghost btn-sm"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDismissedAlert(true)}
                    style={{ gap: '6px' }}
                  >
                    <Eye size={14} /> Acknowledge & Dismiss
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Check-In Status Summary Card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{ marginBottom: '24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardCheck size={18} style={{ color: 'var(--accent-teal)' }} /> Patient Daily Check-In
          </h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className={`badge ${todayCheckins.length >= 3 ? 'badge-success' : allMissedCheckins.length > 0 ? 'badge-danger' : 'badge-warning'}`}>
              {todayCheckins.length}/3 completed
            </span>
            {/* Demo: Simulate missed check-ins */}
            {allMissedCheckins.length < 3 && (
              <motion.button
                className="btn btn-ghost btn-sm"
                whileTap={{ scale: 0.95 }}
                onClick={simulateMissedCheckins}
                style={{
                  fontSize: '0.65rem',
                  padding: '3px 10px',
                  gap: '4px',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-muted)',
                }}
                title="Simulate all 3 check-ins missed for demo"
              >
                <AlertTriangle size={12} /> Simulate Missed
              </motion.button>
            )}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {checkinSchedule.map((slot) => {
            const done = todayCheckins.some(c => c.slotId === slot.id);
            const checkin = todayCheckins.find(c => c.slotId === slot.id);
            const isMissed = allMissedCheckins.some(m => m.id === slot.id);
            const currentHour = new Date().getHours();
            const isActive = currentHour >= slot.startHour && currentHour < slot.endHour;
            return (
              <div key={slot.id} style={{
                padding: '14px',
                background: done ? 'rgba(16, 185, 129, 0.06)' : isMissed ? 'rgba(244, 63, 94, 0.05)' : 'var(--bg-elevated)',
                border: `1px solid ${done ? 'rgba(16, 185, 129, 0.2)' : isMissed ? 'rgba(244, 63, 94, 0.15)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--border-radius-sm)',
                textAlign: 'center',
              }}>
                <div style={{ marginBottom: '6px' }}>
                  {done ? <CheckCircle2 size={22} style={{ color: 'var(--accent-emerald)' }} /> : isMissed ? <XCircle size={22} style={{ color: 'var(--accent-rose)' }} /> : isActive ? <BellRing size={22} style={{ color: 'var(--primary-soft)' }} /> : <Clock size={20} style={{ color: 'var(--text-muted)' }} />}
                </div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{slot.label}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {slot.startHour > 12 ? `${slot.startHour - 12} PM` : `${slot.startHour} AM`} – {slot.endHour > 12 ? `${slot.endHour - 12} PM` : `${slot.endHour} AM`}
                </div>
                {done && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)', marginTop: '6px', fontWeight: 600 }}>
                    ✓ Checked in at {checkin.time}
                  </div>
                )}
                {isMissed && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--accent-rose)', marginTop: '6px', fontWeight: 600 }}>
                    ⚠ Missed
                  </div>
                )}
                {isActive && !done && !isMissed && (
                  <div style={{ fontSize: '0.65rem', color: 'var(--primary-soft)', marginTop: '6px', fontWeight: 600 }}>
                    ⏳ Waiting...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

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
