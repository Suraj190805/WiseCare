'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bluetooth, BluetoothSearching, BluetoothConnected, BluetoothOff,
  Heart, Droplets, Thermometer, Footprints, Flame, Activity,
  Battery, BatteryLow, BatteryMedium, BatteryFull,
  Watch, Wifi, RefreshCw, Settings, X,
  TrendingUp, TrendingDown, Minus, Zap, Signal,
  ArrowRight, CheckCircle2, AlertTriangle, Info,
  Moon, ShieldAlert, Bell, BellRing, CloudUpload
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useWearable } from '@/lib/WearableService';
import { useSharedData } from '@/lib/SharedDataStore';

export default function WearablePage() {
  const {
    connectionStatus,
    deviceInfo,
    isSimulated,
    btSupported,
    error,
    connectDevice,
    disconnectDevice,
    startSimulation,
    heartRate,
    spo2,
    temperature,
    steps,
    calories,
    bloodPressure,
    battery,
    lastSync,
    heartRateHistory,
    spo2History,
    getVitalsForStore,
  } = useWearable();

  const { updateVitals, addAlert, addActivity } = useSharedData();

  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('live');
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isConnected = connectionStatus === 'connected';
  const isScanning = connectionStatus === 'scanning' || connectionStatus === 'connecting';

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Health alert thresholds
  const checkHealthAlerts = useCallback(() => {
    const newAlerts = [];
    if (heartRate && (heartRate > 110 || heartRate < 55)) {
      newAlerts.push({
        id: 'hr_alert',
        type: 'critical',
        vital: 'Heart Rate',
        value: `${heartRate} bpm`,
        message: heartRate > 110 ? 'Heart rate is elevated — please rest and monitor' : 'Heart rate is unusually low — consult doctor',
        icon: Heart,
        color: 'var(--accent-rose)',
        timestamp: Date.now(),
      });
    }
    if (spo2 && spo2 < 93) {
      newAlerts.push({
        id: 'spo2_alert',
        type: 'critical',
        vital: 'SpO₂',
        value: `${spo2}%`,
        message: 'Oxygen level is critically low — seek medical attention',
        icon: Droplets,
        color: 'var(--accent-teal)',
        timestamp: Date.now(),
      });
    }
    if (temperature && (temperature > 100.4 || temperature < 96.0)) {
      newAlerts.push({
        id: 'temp_alert',
        type: 'warning',
        vital: 'Temperature',
        value: `${temperature}°F`,
        message: temperature > 100.4 ? 'Fever detected — monitor closely' : 'Body temperature is low',
        icon: Thermometer,
        color: 'var(--accent-amber)',
        timestamp: Date.now(),
      });
    }
    if (bloodPressure && (bloodPressure.systolic > 139 || bloodPressure.diastolic > 89)) {
      newAlerts.push({
        id: 'bp_alert',
        type: 'warning',
        vital: 'Blood Pressure',
        value: bloodPressure.display,
        message: 'Blood pressure readings are high — consider medication timing',
        icon: Activity,
        color: 'var(--accent-purple)',
        timestamp: Date.now(),
      });
    }
    setHealthAlerts(newAlerts);
  }, [heartRate, spo2, temperature, bloodPressure]);

  useEffect(() => {
    if (isConnected) checkHealthAlerts();
  }, [isConnected, heartRate, spo2, temperature, bloodPressure, checkHealthAlerts]);

  // Sync vitals to SharedDataStore
  const syncToStore = useCallback(() => {
    const vitalsData = getVitalsForStore();
    if (Object.keys(vitalsData).length > 0) {
      updateVitals(vitalsData);
      setSyncStatus('synced');
      addActivity({
        type: 'wearable',
        message: `Wearable vitals synced — HR: ${heartRate || '—'} bpm, SpO₂: ${spo2 || '—'}%`,
        role: 'patient',
        icon: '⌚',
      });
      setTimeout(() => setSyncStatus(null), 3000);
    }
  }, [getVitalsForStore, updateVitals, addActivity, heartRate, spo2]);

  // Auto-sync every 30 seconds when connected
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      const vitalsData = getVitalsForStore();
      if (Object.keys(vitalsData).length > 0) {
        updateVitals(vitalsData);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isConnected, getVitalsForStore, updateVitals]);

  // Push critical alerts to SharedDataStore
  useEffect(() => {
    healthAlerts.filter(a => a.type === 'critical').forEach(alert => {
      addAlert({
        type: 'wearable',
        message: `⌚ Wearable Alert: ${alert.vital} — ${alert.value} — ${alert.message}`,
        severity: 'danger',
        source: 'wearable',
      });
    });
  }, [healthAlerts.length]);

  // Battery icon helper
  const BatteryIcon = () => {
    if (!battery) return <Battery size={16} />;
    if (battery <= 20) return <BatteryLow size={16} />;
    if (battery <= 60) return <BatteryMedium size={16} />;
    return <BatteryFull size={16} />;
  };

  // Sleep score simulation
  const sleepData = {
    score: 78,
    duration: '7h 12m',
    deep: '2h 05m',
    light: '3h 48m',
    rem: '1h 19m',
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Watch size={28} /> Wearable Device
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                Connect your smartwatch or fitness band via Bluetooth
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {isConnected && (
                <>
                  <motion.button
                    className="btn btn-ghost btn-sm"
                    onClick={syncToStore}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)' }}
                  >
                    <CloudUpload size={14} />
                    {syncStatus === 'synced' ? '✓ Synced' : 'Sync to Dashboard'}
                  </motion.button>
                  <div className="wearable-sync-badge">
                    <Signal size={12} />
                    <span>Live</span>
                    {lastSync && (
                      <span className="wearable-sync-time">
                        {lastSync.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Connection + Watch Face Card ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isConnected ? '1fr 320px' : '1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Connection Card */}
        <motion.div
          className={`wearable-connection-card ${connectionStatus}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="wearable-connection-visual">
            <div className={`wearable-device-ring ${isConnected ? 'connected' : isScanning ? 'scanning' : ''}`}>
              <div className="wearable-device-icon">
                {isConnected ? (
                  <BluetoothConnected size={36} />
                ) : isScanning ? (
                  <BluetoothSearching size={36} />
                ) : (
                  <BluetoothOff size={36} />
                )}
              </div>
            </div>
          </div>

          <div className="wearable-connection-info">
            {isConnected ? (
              <>
                <div className="wearable-connection-title">
                  {deviceInfo?.name || 'Connected Device'}
                  {isSimulated && <span className="wearable-sim-badge">Demo</span>}
                </div>
                <div className="wearable-connection-details">
                  <span><Watch size={12} /> {deviceInfo?.model || 'Smart Watch'}</span>
                  <span><BatteryIcon /> {battery !== null ? `${battery}%` : '—'}</span>
                  <span><Wifi size={12} /> Connected</span>
                </div>
                <div className="wearable-connection-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowDeviceInfo(!showDeviceInfo)}>
                    <Info size={14} /> Device Info
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={disconnectDevice} style={{ color: 'var(--accent-rose)' }}>
                    <X size={14} /> Disconnect
                  </button>
                </div>
              </>
            ) : isScanning ? (
              <>
                <div className="wearable-connection-title">
                  {connectionStatus === 'scanning' ? 'Scanning for devices...' : 'Connecting...'}
                </div>
                <div className="wearable-connection-details">
                  <span>Make sure your wearable is nearby and Bluetooth is on</span>
                </div>
                <div className="wearable-scanning-dots">
                  <span /><span /><span />
                </div>
              </>
            ) : (
              <>
                <div className="wearable-connection-title">No Device Connected</div>
                <div className="wearable-connection-details">
                  <span>Connect your smartwatch or fitness band to track real-time health data</span>
                </div>
                <div className="wearable-connection-actions">
                  <motion.button
                    className="btn btn-primary"
                    onClick={connectDevice}
                    whileTap={{ scale: 0.97 }}
                    disabled={!btSupported}
                  >
                    <Bluetooth size={18} /> Connect via Bluetooth
                  </motion.button>
                  <motion.button
                    className="btn btn-teal"
                    onClick={startSimulation}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Zap size={18} /> Demo Mode
                  </motion.button>
                </div>
                {!btSupported && (
                  <div className="wearable-warning">
                    <AlertTriangle size={14} />
                    <span>Web Bluetooth requires Chrome on desktop. Use Demo Mode to preview.</span>
                  </div>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="wearable-error">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}
        </motion.div>

        {/* ── Watch Face Visual ── */}
        {isConnected && (
          <motion.div
            className="watch-face-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <div className="watch-face">
              <div className="watch-face-bezel">
                <div className="watch-face-screen">
                  {/* Time */}
                  <div className="watch-face-time">
                    {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                  <div className="watch-face-date">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>

                  {/* Mini Vitals */}
                  <div className="watch-face-vitals">
                    <div className="watch-face-vital-item">
                      <Heart size={12} className={heartRate ? 'wearable-heartbeat' : ''} style={{ color: '#F43F5E' }} />
                      <span style={{ color: '#F43F5E' }}>{heartRate || '—'}</span>
                    </div>
                    <div className="watch-face-vital-item">
                      <Droplets size={12} style={{ color: '#2DD4BF' }} />
                      <span style={{ color: '#2DD4BF' }}>{spo2 || '—'}%</span>
                    </div>
                  </div>

                  <div className="watch-face-vitals">
                    <div className="watch-face-vital-item">
                      <Footprints size={12} style={{ color: '#10B981' }} />
                      <span style={{ color: '#10B981' }}>{steps ? steps.toLocaleString() : '—'}</span>
                    </div>
                    <div className="watch-face-vital-item">
                      <Flame size={12} style={{ color: '#F59E0B' }} />
                      <span style={{ color: '#F59E0B' }}>{calories || '—'}</span>
                    </div>
                  </div>

                  {/* Steps ring */}
                  <div className="watch-face-ring-container">
                    <svg width="48" height="48" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                      <circle
                        cx="24" cy="24" r="20"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${Math.min(100, ((steps || 0) / 8000) * 100) * 1.257} 125.7`}
                        transform="rotate(-90 24 24)"
                      />
                    </svg>
                    <span className="watch-face-ring-label">{steps ? Math.round((steps / 8000) * 100) : 0}%</span>
                  </div>

                  {/* Battery indicator */}
                  <div className="watch-face-battery">
                    <BatteryIcon />
                    <span>{battery || '—'}%</span>
                  </div>

                  {/* Connection indicator */}
                  <div className="watch-face-bt">
                    <BluetoothConnected size={8} />
                  </div>
                </div>
              </div>
              {/* Band straps */}
              <div className="watch-strap-top" />
              <div className="watch-strap-bottom" />
            </div>
            <div className="watch-face-label">
              {deviceInfo?.name || 'CareWatch'}
              {isSimulated && ' (Demo)'}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Device Info Expandable ── */}
      <AnimatePresence>
        {showDeviceInfo && deviceInfo && (
          <motion.div
            className="card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '20px', overflow: 'hidden' }}
          >
            <h3 className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} /> Device Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Device Name', value: deviceInfo.name },
                { label: 'Manufacturer', value: deviceInfo.manufacturer },
                { label: 'Model', value: deviceInfo.model },
                { label: 'Firmware', value: deviceInfo.firmware },
                { label: 'Type', value: deviceInfo.type },
                { label: 'Connection', value: isSimulated ? 'Simulated (Demo)' : 'Bluetooth LE' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)' }}>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Live Data Section (only when connected) ── */}
      {isConnected && (
        <>
          {/* Health Alert Banner */}
          <AnimatePresence>
            {healthAlerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ marginBottom: '20px' }}
              >
                {healthAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`wearable-health-alert ${alert.type}`}
                  >
                    <div className="wearable-health-alert-icon">
                      <ShieldAlert size={20} />
                    </div>
                    <div className="wearable-health-alert-content">
                      <div className="wearable-health-alert-title">
                        {alert.vital}: {alert.value}
                      </div>
                      <div className="wearable-health-alert-message">{alert.message}</div>
                    </div>
                    <BellRing size={18} style={{ color: alert.color, flexShrink: 0 }} />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Bar */}
          <div className="wearable-tabs">
            {[
              { id: 'live', label: 'Live Data', icon: Activity },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'alerts', label: 'Health Alerts', icon: ShieldAlert, badge: healthAlerts.length },
            ].map(tab => (
              <button
                key={tab.id}
                className={`wearable-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={16} />
                {tab.label}
                {tab.badge > 0 && (
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: 'var(--accent-rose)', color: 'white',
                    fontSize: '0.6rem', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'live' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* ── Vitals Cards Grid ── */}
              <div className="wearable-vitals-grid" style={{ marginTop: '20px' }}>
                {/* Heart Rate — Primary */}
                <motion.div
                  className="wearable-vital-card wearable-vital-primary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="wearable-vital-header">
                    <div className="wearable-vital-icon heart">
                      <Heart size={22} className={heartRate ? 'wearable-heartbeat' : ''} />
                    </div>
                    <span className="wearable-vital-label">Heart Rate</span>
                    <span className="wearable-vital-source">
                      <Watch size={10} /> Wearable
                    </span>
                  </div>
                  <div className="wearable-vital-value-row">
                    <span className="wearable-vital-value heart">{heartRate || '—'}</span>
                    <span className="wearable-vital-unit">bpm</span>
                  </div>
                  <div className="wearable-vital-bar">
                    <div
                      className="wearable-vital-bar-fill heart"
                      style={{ width: `${Math.min(100, ((heartRate || 72) / 180) * 100)}%` }}
                    />
                  </div>
                  <div className="wearable-vital-range">
                    <span>Normal: 60–100 bpm</span>
                    <span className={`wearable-vital-status ${heartRate && heartRate >= 60 && heartRate <= 100 ? 'normal' : 'warning'}`}>
                      {heartRate && heartRate >= 60 && heartRate <= 100 ? '✓ Normal' : heartRate ? '⚠ Check' : '—'}
                    </span>
                  </div>
                  {heartRateHistory.length > 2 && (
                    <div style={{ height: '60px', marginTop: '8px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={heartRateHistory.slice(-12)}>
                          <defs>
                            <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="value" stroke="#F43F5E" fill="url(#hrGrad)" strokeWidth={2} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </motion.div>

                {/* SpO2 */}
                <motion.div
                  className="wearable-vital-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="wearable-vital-header">
                    <div className="wearable-vital-icon spo2">
                      <Droplets size={20} />
                    </div>
                    <span className="wearable-vital-label">SpO₂</span>
                  </div>
                  <div className="wearable-vital-value-row">
                    <span className="wearable-vital-value spo2">{spo2 || '—'}</span>
                    <span className="wearable-vital-unit">%</span>
                  </div>
                  <div className="wearable-vital-bar">
                    <div
                      className="wearable-vital-bar-fill spo2"
                      style={{ width: `${spo2 || 0}%` }}
                    />
                  </div>
                  <div className="wearable-vital-range">
                    <span>Normal: 95–100%</span>
                    <span className={`wearable-vital-status ${spo2 && spo2 >= 95 ? 'normal' : 'warning'}`}>
                      {spo2 && spo2 >= 95 ? '✓ Normal' : spo2 ? '⚠ Low' : '—'}
                    </span>
                  </div>
                </motion.div>

                {/* Temperature */}
                <motion.div
                  className="wearable-vital-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="wearable-vital-header">
                    <div className="wearable-vital-icon temp">
                      <Thermometer size={20} />
                    </div>
                    <span className="wearable-vital-label">Temperature</span>
                  </div>
                  <div className="wearable-vital-value-row">
                    <span className="wearable-vital-value temp">{temperature || '—'}</span>
                    <span className="wearable-vital-unit">°F</span>
                  </div>
                  <div className="wearable-vital-range">
                    <span>Normal: 97.8–99.1°F</span>
                    <span className={`wearable-vital-status ${temperature && temperature >= 97.8 && temperature <= 99.1 ? 'normal' : 'warning'}`}>
                      {temperature && temperature >= 97.8 && temperature <= 99.1 ? '✓ Normal' : temperature ? '⚠ Check' : '—'}
                    </span>
                  </div>
                </motion.div>

                {/* Blood Pressure */}
                <motion.div
                  className="wearable-vital-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="wearable-vital-header">
                    <div className="wearable-vital-icon bp">
                      <Activity size={20} />
                    </div>
                    <span className="wearable-vital-label">Blood Pressure</span>
                  </div>
                  <div className="wearable-vital-value-row">
                    <span className="wearable-vital-value bp">{bloodPressure?.display || '—'}</span>
                    <span className="wearable-vital-unit">mmHg</span>
                  </div>
                  <div className="wearable-vital-range">
                    <span>Normal: &lt;120/80</span>
                    <span className={`wearable-vital-status ${bloodPressure && bloodPressure.systolic < 130 ? 'normal' : 'warning'}`}>
                      {bloodPressure ? bloodPressure.systolic < 130 ? '✓ Normal' : '⚠ Elevated' : '—'}
                    </span>
                  </div>
                </motion.div>

                {/* Steps */}
                <motion.div
                  className="wearable-vital-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="wearable-vital-header">
                    <div className="wearable-vital-icon steps">
                      <Footprints size={20} />
                    </div>
                    <span className="wearable-vital-label">Steps</span>
                  </div>
                  <div className="wearable-vital-value-row">
                    <span className="wearable-vital-value steps">{steps !== null ? steps.toLocaleString() : '—'}</span>
                    <span className="wearable-vital-unit">steps</span>
                  </div>
                  <div className="wearable-vital-bar">
                    <div
                      className="wearable-vital-bar-fill steps"
                      style={{ width: `${Math.min(100, ((steps || 0) / 8000) * 100)}%` }}
                    />
                  </div>
                  <div className="wearable-vital-range">
                    <span>Goal: 8,000 steps</span>
                    <span className="wearable-vital-status normal">{steps ? `${Math.round((steps / 8000) * 100)}%` : '—'}</span>
                  </div>
                </motion.div>

                {/* Calories */}
                <motion.div
                  className="wearable-vital-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="wearable-vital-header">
                    <div className="wearable-vital-icon calories">
                      <Flame size={20} />
                    </div>
                    <span className="wearable-vital-label">Calories</span>
                  </div>
                  <div className="wearable-vital-value-row">
                    <span className="wearable-vital-value calories">{calories || '—'}</span>
                    <span className="wearable-vital-unit">kcal</span>
                  </div>
                  <div className="wearable-vital-range">
                    <span>Goal: 350 kcal</span>
                    <span className="wearable-vital-status normal">{calories ? `${Math.round((calories / 350) * 100)}%` : '—'}</span>
                  </div>
                </motion.div>

                {/* Sleep */}
                <motion.div
                  className="wearable-vital-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <div className="wearable-vital-header">
                    <div className="wearable-vital-icon" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#818CF8' }}>
                      <Moon size={20} />
                    </div>
                    <span className="wearable-vital-label">Sleep Score</span>
                  </div>
                  <div className="wearable-vital-value-row">
                    <span className="wearable-vital-value" style={{ color: '#818CF8' }}>{sleepData.score}</span>
                    <span className="wearable-vital-unit">/ 100</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px' }}>
                    {[
                      { label: 'Deep', value: sleepData.deep, color: '#6366F1' },
                      { label: 'Light', value: sleepData.light, color: '#818CF8' },
                      { label: 'REM', value: sleepData.rem, color: '#A5B4FC' },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{s.label}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: s.color }}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="wearable-vital-range" style={{ marginTop: '8px' }}>
                    <span>Duration: {sleepData.duration}</span>
                    <span className="wearable-vital-status normal">Good</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'trends' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '20px' }}>
              {/* Heart Rate Trend */}
              <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Heart size={18} style={{ color: 'var(--accent-rose)' }} /> Heart Rate Trend
                  </h3>
                  <span className="badge badge-danger">{heartRate || '—'} bpm</span>
                </div>
                <div style={{ height: '220px' }}>
                  {heartRateHistory.length > 2 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={heartRateHistory.slice(-20)}>
                        <defs>
                          <linearGradient id="hrTrendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#F43F5E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                        <YAxis domain={[50, 120]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} width={35} />
                        <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }} formatter={(v) => [`${v} bpm`, 'Heart Rate']} />
                        <Area type="monotone" dataKey="value" stroke="#F43F5E" fill="url(#hrTrendGrad)" strokeWidth={2.5} dot={{ fill: '#F43F5E', r: 3 }} activeDot={{ r: 5, fill: '#F43F5E' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                      Collecting data... Please wait a moment.
                    </div>
                  )}
                </div>
              </div>

              {/* SpO2 Trend */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Droplets size={18} style={{ color: 'var(--accent-teal)' }} /> SpO₂ Trend
                  </h3>
                  <span className="badge badge-success">{spo2 || '—'}%</span>
                </div>
                <div style={{ height: '200px' }}>
                  {spo2History.length > 2 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={spo2History.slice(-15)}>
                        <defs>
                          <linearGradient id="spo2TrendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                        <YAxis domain={[90, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} width={35} />
                        <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }} formatter={(v) => [`${v}%`, 'SpO₂']} />
                        <Area type="monotone" dataKey="value" stroke="#2DD4BF" fill="url(#spo2TrendGrad)" strokeWidth={2.5} dot={{ fill: '#2DD4BF', r: 3 }} activeDot={{ r: 5, fill: '#2DD4BF' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                      Collecting data... Please wait a moment.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: '20px' }}>
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} /> Health Alert Configuration
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: '24px' }}>
                  WiseCare automatically monitors your wearable data and notifies your doctor &amp; caregiver when vitals go outside safe ranges.
                </p>

                {/* Alert thresholds */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {[
                    { vital: 'Heart Rate', icon: Heart, color: '#F43F5E', low: '< 55 bpm', high: '> 110 bpm', status: heartRate && (heartRate > 110 || heartRate < 55) ? 'triggered' : 'normal' },
                    { vital: 'SpO₂', icon: Droplets, color: '#2DD4BF', low: '< 93%', high: '—', status: spo2 && spo2 < 93 ? 'triggered' : 'normal' },
                    { vital: 'Temperature', icon: Thermometer, color: '#F59E0B', low: '< 96.0°F', high: '> 100.4°F', status: temperature && (temperature > 100.4 || temperature < 96.0) ? 'triggered' : 'normal' },
                    { vital: 'Blood Pressure', icon: Activity, color: '#A855F7', low: '—', high: '> 140/90 mmHg', status: bloodPressure && (bloodPressure.systolic > 139 || bloodPressure.diastolic > 89) ? 'triggered' : 'normal' },
                  ].map((threshold, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      style={{
                        padding: '20px',
                        background: threshold.status === 'triggered' ? `${threshold.color}08` : 'var(--bg-elevated)',
                        border: `1px solid ${threshold.status === 'triggered' ? `${threshold.color}40` : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--border-radius)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${threshold.color}18`, color: threshold.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <threshold.icon size={18} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{threshold.vital}</span>
                        </div>
                        <span className={`badge ${threshold.status === 'triggered' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.65rem' }}>
                          {threshold.status === 'triggered' ? '⚠ Triggered' : '✓ Normal'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--border-radius-sm)' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Low Alert</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--accent-teal)' }}>{threshold.low}</div>
                        </div>
                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--border-radius-sm)' }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>High Alert</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--accent-rose)' }}>{threshold.high}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Notification targets */}
                <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-subtle)' }}>
                  <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={16} /> Alert Recipients
                  </h4>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    {[
                      { name: 'Dr. Priya Sharma', role: 'Doctor', avatar: '👩‍⚕️', status: 'Active' },
                      { name: 'Meera Kumar', role: 'Caregiver', avatar: '👩', status: 'Active' },
                      { name: 'Self (Rajan)', role: 'Patient', avatar: '👤', status: 'Active' },
                    ].map((person, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'rgba(0,0,0,0.15)', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: '1.4rem' }}>{person.avatar}</span>
                        <div>
                          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>{person.name}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{person.role}</div>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: '0.55rem' }}>{person.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* ── Not Connected State ── */}
      {!isConnected && !isScanning && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Supported Devices */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '20px' }}>Supported Devices</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {[
                { name: 'Apple Watch', icon: '⌚', desc: 'Series 4+' },
                { name: 'Samsung Galaxy Watch', icon: '⌚', desc: 'Watch 4+' },
                { name: 'Fitbit', icon: '💪', desc: 'Sense, Versa, Charge' },
                { name: 'Xiaomi Mi Band', icon: '📱', desc: 'Band 5+' },
                { name: 'Amazfit', icon: '⌚', desc: 'GTR, GTS, T-Rex' },
                { name: 'Garmin', icon: '🏃', desc: 'Venu, Forerunner' },
              ].map((device, i) => (
                <motion.div
                  key={i}
                  className="wearable-device-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                >
                  <div className="wearable-device-emoji">{device.icon}</div>
                  <div className="wearable-device-name">{device.name}</div>
                  <div className="wearable-device-desc">{device.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How it Works */}
          <div className="card" style={{ marginTop: '20px' }}>
            <h3 className="card-title" style={{ marginBottom: '20px' }}>How It Works</h3>
            <div className="wearable-steps">
              {[
                { step: 1, title: 'Enable Bluetooth', desc: 'Turn on Bluetooth on your computer and wearable device', icon: Bluetooth },
                { step: 2, title: 'Pair Device', desc: 'Click "Connect via Bluetooth" and select your device from the list', icon: BluetoothSearching },
                { step: 3, title: 'Track Health', desc: 'View real-time health data from your wearable — heart rate, SpO₂, steps, and more', icon: Heart },
              ].map((s, i) => (
                <div key={i} className="wearable-step">
                  <div className="wearable-step-number">{s.step}</div>
                  <div className="wearable-step-icon"><s.icon size={22} /></div>
                  <div className="wearable-step-content">
                    <div className="wearable-step-title">{s.title}</div>
                    <div className="wearable-step-desc">{s.desc}</div>
                  </div>
                  {i < 2 && <ArrowRight size={18} className="wearable-step-arrow" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
