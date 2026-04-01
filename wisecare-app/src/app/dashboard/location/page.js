'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Shield, Clock, Navigation, Battery, Wifi, WifiOff,
  Plus, Settings, Eye, EyeOff, Home, TreePine, Landmark
} from 'lucide-react';
import { MOCK_LOCATION_HISTORY, MOCK_SAFE_ZONES, MOCK_USERS } from '@/lib/mockData';

export default function LocationPage() {
  const [activeTab, setActiveTab] = useState('live');
  const [locationSharing, setLocationSharing] = useState(true);
  const user = MOCK_USERS.patient;

  const zoneIcons = { Home: '🏠', Park: '🌳', Temple: '🛕' };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Live Location</h1>
            <p className="page-description">Real-time GPS tracking with safe zone alerts</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Location Sharing</span>
            <motion.button
              onClick={() => setLocationSharing(!locationSharing)}
              style={{
                width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: locationSharing ? 'var(--accent-emerald)' : 'var(--bg-elevated)',
                position: 'relative', transition: 'background 0.2s'
              }}
            >
              <motion.div
                animate={{ x: locationSharing ? 24 : 2 }}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%', background: 'white',
                  position: 'absolute', top: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pill-tabs" style={{ marginBottom: '24px' }}>
        {['live', 'history', 'zones'].map(tab => (
          <button
            key={tab}
            className={`pill-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'live' ? 'Live Map' : tab === 'history' ? 'Location History' : 'Safe Zones'}
          </button>
        ))}
      </div>

      {activeTab === 'live' && (
        <div className="grid-2">
          {/* Map */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="map-container" style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1420 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {/* Simulated Map */}
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {/* Grid lines */}
                <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 25} x2="100%" y2={i * 25} stroke="white" strokeWidth="0.5" />
                  ))}
                  {Array.from({ length: 30 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 25} y1="0" x2={i * 25} y2="100%" stroke="white" strokeWidth="0.5" />
                  ))}
                </svg>

                {/* Safe zone circles */}
                <div style={{
                  position: 'absolute', top: '45%', left: '40%', width: '150px', height: '150px',
                  borderRadius: '50%', border: '2px dashed rgba(45, 212, 191, 0.4)',
                  background: 'rgba(45, 212, 191, 0.05)', transform: 'translate(-50%, -50%)'
                }} />
                <div style={{
                  position: 'absolute', top: '30%', left: '65%', width: '100px', height: '100px',
                  borderRadius: '50%', border: '2px dashed rgba(139, 92, 246, 0.4)',
                  background: 'rgba(139, 92, 246, 0.05)', transform: 'translate(-50%, -50%)'
                }} />

                {/* Location Marker */}
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    position: 'absolute', top: '45%', left: '40%',
                    transform: 'translate(-50%, -50%)', zIndex: 10
                  }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50% 50% 50% 0',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent-teal))',
                    transform: 'rotate(-45deg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(79, 107, 255, 0.4)'
                  }}>
                    <span style={{ transform: 'rotate(45deg)', fontSize: '1.2rem' }}>📍</span>
                  </div>
                  <div style={{
                    width: '24px', height: '6px', borderRadius: '50%',
                    background: 'rgba(79, 107, 255, 0.3)',
                    margin: '4px auto 0', filter: 'blur(2px)'
                  }} />
                </motion.div>

                {/* Zone labels */}
                <div style={{ position: 'absolute', top: '58%', left: '40%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '8px', color: 'var(--accent-teal)' }}>🏠 Home</span>
                </div>
                <div style={{ position: 'absolute', top: '38%', left: '65%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', background: 'rgba(0,0,0,0.7)', padding: '4px 10px', borderRadius: '8px', color: 'var(--accent-purple)' }}>🌳 Park</span>
                </div>

                {/* Map info overlay */}
                <div style={{
                  position: 'absolute', bottom: '16px', left: '16px', right: '16px',
                  padding: '14px 18px', background: 'rgba(17, 24, 39, 0.9)', backdropFilter: 'blur(10px)',
                  borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-subtle)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MapPin size={18} style={{ color: 'var(--accent-teal)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{user.location.address}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        {user.location.lat.toFixed(4)}, {user.location.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-success">In Safe Zone</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Current Status */}
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '16px' }}>Current Status</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { icon: <Navigation size={18} />, label: 'Current Location', value: user.location.address, color: 'var(--accent-teal)' },
                  { icon: <Shield size={18} />, label: 'Zone Status', value: 'Inside Home Safe Zone', color: 'var(--accent-emerald)' },
                  { icon: <Clock size={18} />, label: 'Last Updated', value: '30 seconds ago', color: 'var(--primary-soft)' },
                  { icon: <Battery size={18} />, label: 'Device Battery', value: '78%', color: 'var(--accent-amber)' },
                  { icon: <Wifi size={18} />, label: 'Connection', value: 'Online (4G)', color: 'var(--accent-emerald)' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                    background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)'
                  }}>
                    <div style={{ color: item.color }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{item.label}</div>
                      <div style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note about Google Maps */}
            <div className="card" style={{ background: 'rgba(79, 107, 255, 0.05)', borderColor: 'rgba(79, 107, 255, 0.2)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <MapPin size={20} style={{ color: 'var(--primary-soft)', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>Google Maps Integration</h3>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    Add your Google Maps API key in settings to enable full interactive maps with street view and navigation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '24px' }}>Today's Location History</h2>
          <div className="timeline">
            {MOCK_LOCATION_HISTORY.map((loc, i) => (
              <div key={i} className="timeline-item">
                <div className={`timeline-dot ${loc.zone === 'safe' ? 'done' : 'missed'}`} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div className="timeline-time">{loc.time}</div>
                    <div style={{ fontWeight: 600 }}>{loc.place}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                    </div>
                  </div>
                  <span className={`badge ${loc.zone === 'safe' ? 'badge-success' : 'badge-danger'}`}>
                    {loc.zone === 'safe' ? '✓ Safe Zone' : '⚠ Outside'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'zones' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }}>
              <Plus size={18} /> Add Safe Zone
            </motion.button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {MOCK_SAFE_ZONES.map((zone, i) => (
              <motion.div
                key={zone.id}
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '14px',
                      background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '1.8rem'
                    }}>
                      {zoneIcons[zone.name] || '📍'}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-lg)' }}>{zone.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        Radius: {zone.radius}m • {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`badge ${zone.active ? 'badge-success' : 'badge-info'}`}>
                      {zone.active ? 'Active' : 'Inactive'}
                    </span>
                    <button className="btn btn-ghost btn-sm">
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
