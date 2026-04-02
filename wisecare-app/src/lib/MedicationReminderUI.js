'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Phone, PhoneOff, PhoneCall, PhoneIncoming, AlertTriangle,
  CheckCircle2, X, Pill, Clock, Users, MessageSquare,
  Volume2, VolumeX, Settings, ChevronDown, ChevronUp,
  Shield, UserCheck, Stethoscope, Send, Mic, MicOff,
  Calendar, Timer, Play, Square, Megaphone
} from 'lucide-react';
import { useReminders } from './MedicationReminderService';

// ──────────────────────────────────────────────────────
// MedicationReminderUI — Renders all reminder overlays,
// voice alert controls, upcoming reminders, daily panel
// ──────────────────────────────────────────────────────

export default function MedicationReminderUI() {
  const {
    activeReminders,
    escalationLog,
    activeCallSimulation,
    contactAlerts,
    acknowledgeReminder,
    dismissCall,
    answerCall,
    triggerDemoReminder,
    reminderSettings,
    setReminderSettings,
    upcomingReminders,
    notificationPermission,
    speakDailySummary,
    speakAlert,
    stopSpeaking,
  } = useReminders();

  const [showEscalationLog, setShowEscalationLog] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [permissionDismissed, setPermissionDismissed] = useState(false);

  const unacknowledgedReminders = activeReminders.filter(r => !r.acknowledged);
  const hasActiveAlerts = unacknowledgedReminders.length > 0 || activeCallSimulation;

  // Track speech synthesis state
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const interval = setInterval(() => {
      setIsSpeaking(window.speechSynthesis.speaking);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Check if user previously dismissed the permission prompt
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('wisecare_notif_prompt_dismissed');
      if (dismissed) setPermissionDismissed(true);
    } catch {}
  }, []);

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      if (result === 'granted') {
        // Send a test notification to confirm it works
        new Notification('✅ System Notifications Enabled!', {
          body: 'You will now receive medication reminders as system notifications on your Mac.',
          icon: '🩺',
          tag: 'test_notification',
        });
      }
    }
  };

  const dismissPermissionPrompt = () => {
    setPermissionDismissed(true);
    try {
      localStorage.setItem('wisecare_notif_prompt_dismissed', 'true');
    } catch {}
  };

  const nextUpcoming = upcomingReminders.find(r => !r.isDue);
  const dueNow = upcomingReminders.filter(r => r.isDue);

  return (
    <>
      {/* ── System Notification Permission Banner ── */}
      <AnimatePresence>
        {notificationPermission !== 'granted' && !permissionDismissed && (
          <motion.div
            className="med-notif-permission-banner"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="med-notif-permission-icon">🔔</div>
            <div className="med-notif-permission-content">
              <div className="med-notif-permission-title">Enable System Notifications</div>
              <div className="med-notif-permission-desc">
                Get medication reminders as native macOS notifications — even when the browser tab is in the background.
              </div>
            </div>
            <div className="med-notif-permission-actions">
              <motion.button
                className="btn btn-primary btn-sm"
                onClick={handleEnableNotifications}
                whileTap={{ scale: 0.95 }}
              >
                <Bell size={16} /> Allow Notifications
              </motion.button>
              <motion.button
                className="btn btn-ghost btn-sm"
                onClick={dismissPermissionPrompt}
                whileTap={{ scale: 0.95 }}
                style={{ padding: '8px 12px', minHeight: 'unset' }}
              >
                <X size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Active Medication Reminder Banners ── */}
      <div className="med-reminder-container">
        <AnimatePresence>
          {unacknowledgedReminders.map(reminder => (
            <motion.div
              key={reminder.id}
              className={`med-reminder-banner stage-${reminder.stage}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="med-reminder-banner-icon">
                {reminder.stage === 1 && <Pill size={24} />}
                {reminder.stage === 2 && <PhoneCall size={24} />}
                {reminder.stage === 3 && <AlertTriangle size={24} />}
              </div>

              <div className="med-reminder-banner-content">
                <div className="med-reminder-banner-title">
                  {reminder.stage === 1 && `💊 Time for ${reminder.medName}`}
                  {reminder.stage === 2 && `📞 Calling you — Take ${reminder.medName}`}
                  {reminder.stage === 3 && `🚨 Caregiver & Doctor Alerted`}
                </div>
                <div className="med-reminder-banner-subtitle">
                  {reminder.dosage} — {reminder.instructions}
                  {reminder.stage >= 2 && (
                    <span className="med-reminder-escalated"> • Escalated</span>
                  )}
                </div>
                <div className="med-reminder-banner-time">
                  <Clock size={12} /> Scheduled: {reminder.time}
                  {reminderSettings.voiceEnabled && (
                    <span className="med-voice-indicator">
                      <Volume2 size={10} /> Voice Alert Active
                    </span>
                  )}
                </div>
              </div>

              <div className="med-reminder-banner-actions">
                <motion.button
                  className="btn btn-teal btn-sm"
                  onClick={() => acknowledgeReminder(reminder.id)}
                  whileTap={{ scale: 0.95 }}
                >
                  <CheckCircle2 size={16} /> Taken
                </motion.button>
              </div>

              {/* Stage indicator dots */}
              <div className="med-reminder-stages">
                <div className={`med-reminder-stage-dot ${reminder.stage >= 1 ? 'active' : ''}`} title="Notification" />
                <div className={`med-reminder-stage-dot ${reminder.stage >= 2 ? 'active' : ''}`} title="Call" />
                <div className={`med-reminder-stage-dot ${reminder.stage >= 3 ? 'active' : ''}`} title="Contact Alert" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Simulated Incoming Call Overlay ── */}
      <AnimatePresence>
        {activeCallSimulation && (
          <motion.div
            className="med-call-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="med-call-card"
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="med-call-avatar-wrap">
                <div className="med-call-avatar-ring ring-1" />
                <div className="med-call-avatar-ring ring-2" />
                <div className="med-call-avatar-ring ring-3" />
                <div className="med-call-avatar">
                  <PhoneIncoming size={32} />
                </div>
              </div>

              <div className="med-call-label">Incoming Call</div>
              <div className="med-call-caller">{activeCallSimulation.callerName}</div>
              <div className="med-call-reason">
                <Pill size={14} />
                Medication Reminder: {activeCallSimulation.medName} {activeCallSimulation.dosage}
              </div>
              <div className="med-call-message">
                You haven&apos;t taken your medication. Please take it now.
              </div>

              <div className="med-call-actions">
                <motion.button
                  className="med-call-btn decline"
                  onClick={() => dismissCall(activeCallSimulation.id)}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <PhoneOff size={24} />
                  <span>Decline</span>
                </motion.button>
                <motion.button
                  className="med-call-btn answer"
                  onClick={() => answerCall(activeCallSimulation.id)}
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Phone size={24} />
                  <span>Answer</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Contact Alert Notifications (bottom-right) ── */}
      <div className="med-contact-alerts-container">
        <AnimatePresence>
          {contactAlerts.slice(0, 4).map((alert, idx) => (
            <motion.div
              key={alert.id}
              className="med-contact-alert"
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ delay: idx * 0.15 }}
            >
              <div className="med-contact-alert-icon">
                {alert.recipient === 'caregiver' ? <UserCheck size={18} /> : <Stethoscope size={18} />}
              </div>
              <div className="med-contact-alert-body">
                <div className="med-contact-alert-header">
                  <span className="med-contact-alert-name">{alert.recipientName}</span>
                  <span className="med-contact-alert-role">{alert.recipientRole}</span>
                </div>
                <div className="med-contact-alert-msg">
                  {alert.recipient === 'caregiver'
                    ? `Message sent: ${alert.patientName} missed ${alert.medName}`
                    : `Alert sent: ${alert.patientName} missed ${alert.medName}`
                  }
                </div>
                <div className="med-contact-alert-status">
                  <Send size={10} />
                  {alert.type === 'sms' ? 'SMS' : 'Message'} — {alert.status === 'sent' ? '✓ Delivered' : 'Sending...'}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Upcoming Reminders Panel (top-right) ── */}
      {upcomingReminders.length > 0 && (
        <motion.div
          className="med-upcoming-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <button
            className="med-upcoming-toggle"
            onClick={() => setShowUpcoming(!showUpcoming)}
          >
            <div className="med-upcoming-toggle-left">
              <Timer size={14} />
              <span>Upcoming Meds</span>
              <span className="med-upcoming-count">{upcomingReminders.filter(r => !r.isDue).length}</span>
              {dueNow.length > 0 && (
                <span className="med-upcoming-due-badge">{dueNow.length} Due</span>
              )}
            </div>
            {showUpcoming ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          <AnimatePresence>
            {showUpcoming && (
              <motion.div
                className="med-upcoming-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {upcomingReminders.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`med-upcoming-item ${item.isDue ? 'due-now' : item.isSoon ? 'due-soon' : ''}`}
                  >
                    <div className="med-upcoming-item-time">
                      <Clock size={12} />
                      {item.timeFormatted}
                    </div>
                    <div className="med-upcoming-item-info">
                      <div className="med-upcoming-item-name">{item.medName}</div>
                      <div className="med-upcoming-item-dosage">{item.dosage}</div>
                    </div>
                    <div className={`med-upcoming-item-countdown ${item.isDue ? 'due' : item.isSoon ? 'soon' : ''}`}>
                      {item.isDue ? (
                        <span className="med-due-pulse">⏰ NOW</span>
                      ) : (
                        <span>in {item.timeUntilFormatted}</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Voice Summary Button */}
                <button
                  className="med-upcoming-voice-btn"
                  onClick={speakDailySummary}
                  disabled={isSpeaking}
                >
                  {isSpeaking ? (
                    <>
                      <Volume2 size={14} className="med-voice-speaking-icon" />
                      Speaking...
                    </>
                  ) : (
                    <>
                      <Megaphone size={14} />
                      Hear Daily Summary
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Voice Alert & Demo Controls (bottom left) ── */}
      <div className="med-controls-container">
        {/* Voice Alert Toggle */}
        <motion.button
          className={`med-voice-toggle ${reminderSettings.voiceEnabled ? 'active' : ''}`}
          onClick={() => {
            if (isSpeaking) {
              stopSpeaking();
            }
            setReminderSettings(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }));
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, type: 'spring' }}
          title={reminderSettings.voiceEnabled ? 'Voice alerts ON — click to mute' : 'Voice alerts OFF — click to enable'}
        >
          {reminderSettings.voiceEnabled ? (
            <>
              <Volume2 size={16} className={isSpeaking ? 'med-voice-speaking-icon' : ''} />
              <span>Voice {isSpeaking ? 'Speaking' : 'ON'}</span>
            </>
          ) : (
            <>
              <VolumeX size={16} />
              <span>Voice OFF</span>
            </>
          )}
        </motion.button>

        {/* Demo Trigger */}
        {reminderSettings.demoMode && (
          <motion.button
            className="med-demo-trigger"
            onClick={() => triggerDemoReminder('med_001')}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 2, type: 'spring' }}
            title="Trigger a demo medication reminder"
          >
            <Bell size={16} />
            <span>Demo Reminder</span>
          </motion.button>
        )}
      </div>

      {/* ── Escalation Activity Log (expandable panel) ── */}
      {escalationLog.length > 0 && (
        <motion.div
          className="med-escalation-log"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            className="med-escalation-log-toggle"
            onClick={() => setShowEscalationLog(!showEscalationLog)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={14} />
              <span>Reminder Activity</span>
              <span className="med-escalation-log-count">{escalationLog.length}</span>
            </div>
            {showEscalationLog ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          <AnimatePresence>
            {showEscalationLog && (
              <motion.div
                className="med-escalation-log-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {escalationLog.slice(0, 10).map((entry, idx) => (
                  <div key={idx} className="med-escalation-log-entry">
                    <div className={`med-escalation-log-dot ${entry.type}`} />
                    <div className="med-escalation-log-content">
                      <div className="med-escalation-log-msg">{entry.message}</div>
                      <div className="med-escalation-log-time">
                        {entry.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}
