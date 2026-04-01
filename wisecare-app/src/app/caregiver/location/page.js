'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, Clock, Shield, AlertTriangle,
  CheckCircle2, Wifi, Battery, BatteryFull, RefreshCcw,
  Plus, Trash2, Edit, Power
} from 'lucide-react';
import { MOCK_USERS, MOCK_LOCATION_HISTORY, MOCK_SAFE_ZONES } from '@/lib/mockData';
import { useToast } from '@/lib/Toast';
import Modal from '@/lib/Modal';

export default function CaregiverLocationPage() {
  const { addToast } = useToast();
  const patient = MOCK_USERS.patient;
  const [refreshing, setRefreshing] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [safeZones, setSafeZones] = useState(MOCK_SAFE_ZONES);
  const [locationHistory, setLocationHistory] = useState(MOCK_LOCATION_HISTORY);
  const [newZone, setNewZone] = useState({ name: '', radius: 200 });
  const [lastUpdate, setLastUpdate] = useState('Just now');

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    addToast('📍 Refreshing location...', 'info');
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdate('Just now');
      addToast('✅ Location updated — Rajan is at Home', 'success');
    }, 2000);
  }, [addToast]);

  const handleAddZone = () => {
    if (!newZone.name) {
      addToast('Please enter a zone name', 'warning');
      return;
    }
    const zone = {
      id: `zone_${Date.now()}`,
      name: newZone.name,
      lat: 12.9716 + (Math.random() - 0.5) * 0.01,
      lng: 77.5946 + (Math.random() - 0.5) * 0.01,
      radius: newZone.radius,
      active: true
    };
    setSafeZones(prev => [...prev, zone]);
    setShowAddZone(false);
    setNewZone({ name: '', radius: 200 });
    addToast(`✅ Safe zone "${zone.name}" added (${zone.radius}m radius)`, 'success');
  };

  const toggleZone = (zoneId) => {
    setSafeZones(prev => prev.map(z => {
      if (z.id === zoneId) {
        const newState = !z.active;
        addToast(`${z.name} zone ${newState ? 'activated' : 'deactivated'}`, newState ? 'success' : 'warning');
        return { ...z, active: newState };
      }
      return z;
    }));
  };

  const deleteZone = (zoneId) => {
    const zone = safeZones.find(z => z.id === zoneId);
    setSafeZones(prev => prev.filter(z => z.id !== zoneId));
    addToast(`Safe zone "${zone?.name}" removed`, 'info');
  };

  const handleSOS = () => {
    addToast('🚨 SOS Alert sent! Emergency contacts notified.', 'error');
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Live Location</h1>
            <p className="page-description">Real-time GPS tracking for {patient.name} • Updated {lastUpdate}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button
              className="btn btn-ghost"
              whileTap={{ scale: 0.97 }}
              onClick={handleRefresh}
              disabled={refreshing}
              style={{ opacity: refreshing ? 0.7 : 1 }}
            >
              <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
                <RefreshCcw size={18} />
              </motion.div>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </motion.button>
            <motion.button className="btn btn-danger btn-sm" whileTap={{ scale: 0.97 }} onClick={handleSOS}>
              🚨 SOS
            </motion.button>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Map */}
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
            <div style={{
              height: '450px', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {/* Grid lines */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.06,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }} />

              {/* Safe zone circles */}
              {safeZones.filter(z => z.active).map((zone, i) => (
                <motion.div
                  key={zone.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.15, type: 'spring' }}
                  style={{
                    position: 'absolute',
                    width: `${zone.radius * 0.8}px`, height: `${zone.radius * 0.8}px`,
                    borderRadius: '50%',
                    background: 'rgba(45, 212, 191, 0.08)',
                    border: `2px dashed rgba(45, 212, 191, 0.3)`,
                    top: `${30 + i * 15}%`, left: `${20 + i * 25}%`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-teal)', textAlign: 'center' }}>
                    {zone.name}
                  </span>
                </motion.div>
              ))}

              {/* User marker */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: refreshing ? [1, 1.2, 1] : 1 }}
                transition={refreshing ? { duration: 0.5, repeat: Infinity } : {}}
                style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent-teal))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(79, 107, 255, 0.4)',
                  border: '3px solid white', zIndex: 2
                }}
              >
                <Navigation size={22} style={{ color: 'white' }} />
              </motion.div>

              {/* Label */}
              <div style={{
                position: 'absolute', bottom: '16px', left: '16px', right: '16px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{
                  padding: '8px 14px', background: 'rgba(0,0,0,0.6)', borderRadius: 'var(--border-radius-sm)',
                  backdropFilter: 'blur(10px)', fontSize: 'var(--font-size-xs)'
                }}>
                  📍 {patient.location.address}
                </div>
                <div style={{
                  padding: '8px 14px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--border-radius-sm)',
                  fontSize: 'var(--font-size-xs)', color: 'var(--accent-emerald)', fontWeight: 600
                }}>
                  ✓ Inside Safe Zone
                </div>
              </div>
            </div>
          </div>

          {/* Device Status */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '16px' }}>Device Status</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {[
                { icon: Wifi, label: 'GPS Signal', value: 'Strong', color: 'var(--accent-emerald)' },
                { icon: BatteryFull, label: 'Battery', value: '78%', color: 'var(--accent-teal)' },
                { icon: Shield, label: 'Status', value: 'Safe Zone', color: 'var(--accent-emerald)' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '16px', textAlign: 'center', background: 'var(--bg-elevated)',
                  borderRadius: 'var(--border-radius-sm)'
                }}>
                  <item.icon size={22} style={{ color: item.color, marginBottom: '8px' }} />
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>{item.value}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Location History */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '16px' }}>Today's Movement</h2>
            <div className="timeline">
              {locationHistory.map((loc, i) => (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${loc.zone === 'safe' ? 'done' : 'missed'}`} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{loc.place}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="timeline-time">{loc.time}</span>
                      <span className={`badge ${loc.zone === 'safe' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem', display: 'block', marginTop: '4px' }}>
                        {loc.zone === 'safe' ? '✓ Safe' : '⚠ Outside'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safe Zones */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="card-title">Safe Zones ({safeZones.length})</h2>
              <motion.button className="btn btn-primary btn-sm" whileTap={{ scale: 0.95 }} onClick={() => setShowAddZone(true)}>
                <Plus size={16} /> Add Zone
              </motion.button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <AnimatePresence>
                {safeZones.map((zone) => (
                  <motion.div
                    key={zone.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 16px', background: 'var(--bg-elevated)',
                      borderRadius: 'var(--border-radius-sm)',
                      border: zone.active ? '1px solid var(--accent-teal-soft)' : '1px solid transparent',
                      opacity: zone.active ? 1 : 0.6
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <MapPin size={18} style={{ color: zone.active ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{zone.name}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                          Radius: {zone.radius}m
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleZone(zone.id)}
                        style={{
                          width: '44px', height: '24px', borderRadius: '12px',
                          background: zone.active ? 'var(--accent-emerald)' : 'var(--bg-card)',
                          border: `1px solid ${zone.active ? 'var(--accent-emerald)' : 'var(--border-default)'}`,
                          cursor: 'pointer', position: 'relative', transition: 'all 200ms ease',
                          padding: 0
                        }}
                      >
                        <motion.div
                          animate={{ x: zone.active ? 20 : 2 }}
                          style={{
                            width: '18px', height: '18px', borderRadius: '50%',
                            background: 'white', position: 'absolute', top: '2px'
                          }}
                        />
                      </motion.button>
                      <motion.button
                        className="btn btn-ghost btn-sm"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deleteZone(zone.id)}
                        style={{ padding: '4px 6px', minHeight: 'unset', color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Add Zone Modal */}
      <Modal isOpen={showAddZone} onClose={() => setShowAddZone(false)} title="Add Safe Zone" subtitle="Define a new geofenced area">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="input-group">
            <label className="input-label">Zone Name</label>
            <input className="input" placeholder="e.g. Hospital, Market, Friend's House" value={newZone.name} onChange={(e) => setNewZone(prev => ({ ...prev, name: e.target.value }))} />
          </div>

          <div className="input-group">
            <label className="input-label">Radius: {newZone.radius}m</label>
            <input
              type="range"
              min={50}
              max={500}
              step={50}
              value={newZone.radius}
              onChange={(e) => setNewZone(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              <span>50m</span>
              <span>500m</span>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            💡 You'll receive an alert when Rajan enters or leaves this zone. The location will be auto-detected from GPS.
          </div>

          <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={handleAddZone} style={{ width: '100%' }}>
            <Plus size={18} /> Add Safe Zone
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}
