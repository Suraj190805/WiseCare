'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin, Shield, Clock, Navigation, Battery, Wifi,
  Plus, Settings, RefreshCw, Crosshair, AlertTriangle
} from 'lucide-react';
import { MOCK_SAFE_ZONES } from '@/lib/mockData';

export default function LocationPage() {
  const [activeTab, setActiveTab] = useState('live');
  const [locationSharing, setLocationSharing] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const watchIdRef = useRef(null);

  const zoneIcons = { Home: '🏠', Park: '🌳', Temple: '🛕' };

  // Reverse geocode using Nominatim (OpenStreetMap)
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data.display_name) {
        // Return a short address
        const parts = data.display_name.split(',');
        return parts.slice(0, 3).join(',').trim();
      }
    } catch (e) {
      console.warn('Reverse geocode failed:', e);
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }, []);

  // Check if location is inside any safe zone
  const checkSafeZone = useCallback((lat, lng) => {
    for (const zone of MOCK_SAFE_ZONES) {
      const distance = getDistanceMeters(lat, lng, zone.lat, zone.lng);
      if (distance <= zone.radius) {
        return { inZone: true, zoneName: zone.name };
      }
    }
    return { inZone: false, zoneName: null };
  }, []);

  // Haversine distance in meters
  const getDistanceMeters = (lat1, lng1, lat2, lng2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Get location and update state
  const updateLocation = useCallback(async (position) => {
    const { latitude, longitude, accuracy, speed, heading } = position.coords;
    const address = await reverseGeocode(latitude, longitude);
    const zoneCheck = checkSafeZone(latitude, longitude);
    const now = new Date();

    const loc = {
      lat: latitude,
      lng: longitude,
      accuracy: Math.round(accuracy),
      speed: speed ? (speed * 3.6).toFixed(1) : '0',
      heading: heading || 0,
      address,
      zone: zoneCheck,
      time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      timestamp: now,
    };

    setCurrentLocation(loc);
    setLastUpdated(now);
    setLocationError(null);
    setIsRefreshing(false);

    // Add to history (avoid duplicates within 30 seconds)
    setLocationHistory(prev => {
      const last = prev[0];
      if (last && (now - last.timestamp) < 30000) return prev;
      return [loc, ...prev].slice(0, 50);
    });
  }, [reverseGeocode, checkSafeZone]);

  // Start watching location
  useEffect(() => {
    if (!locationSharing) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsRefreshing(true);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      updateLocation,
      (err) => {
        setLocationError(err.message);
        setIsRefreshing(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    // Watch for changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      updateLocation,
      (err) => setLocationError(err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [locationSharing, updateLocation]);

  // Manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    navigator.geolocation.getCurrentPosition(
      updateLocation,
      (err) => { setLocationError(err.message); setIsRefreshing(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Time ago string
  const getTimeAgo = () => {
    if (!lastUpdated) return 'Never';
    const diff = Math.floor((Date.now() - lastUpdated) / 1000);
    if (diff < 5) return 'Just now';
    if (diff < 60) return `${diff} seconds ago`;
    return `${Math.floor(diff / 60)} min ago`;
  };

  // Auto-update "time ago" every 5 seconds
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  // Map URL using OpenStreetMap
  const getMapUrl = () => {
    if (!currentLocation) return null;
    const { lat, lng } = currentLocation;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.003},${lng + 0.005},${lat + 0.003}&layer=mapnik&marker=${lat},${lng}`;
  };

  const getGoogleMapsLink = () => {
    if (!currentLocation) return '#';
    return `https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Live Location</h1>
            <p className="page-description">Real-time GPS tracking with safe zone alerts</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <motion.button
              className="btn btn-ghost btn-sm"
              onClick={handleRefresh}
              whileTap={{ scale: 0.95 }}
              disabled={isRefreshing}
              style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <motion.div animate={isRefreshing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}>
                <RefreshCw size={16} />
              </motion.div>
              Refresh
            </motion.button>
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

      {/* Error State */}
      {locationError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ 
            background: 'rgba(244, 63, 94, 0.08)', borderColor: 'rgba(244, 63, 94, 0.3)',
            marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center'
          }}
        >
          <AlertTriangle size={20} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Location Access Error</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              {locationError}. Please allow location access in your browser settings.
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'live' && (
        <div className="grid-2">
          {/* Map */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="map-container" style={{ position: 'relative', minHeight: '400px' }}>
              {currentLocation ? (
                <>
                  <iframe
                    src={getMapUrl()}
                    style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', inset: 0 }}
                    title="Live Location Map"
                    loading="lazy"
                  />
                  {/* Overlay info bar */}
                  <div style={{
                    position: 'absolute', bottom: '0', left: '0', right: '0',
                    padding: '14px 18px', background: 'rgba(17, 24, 39, 0.92)', backdropFilter: 'blur(10px)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Crosshair size={18} style={{ color: 'var(--accent-teal)' }} />
                      </motion.div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'white' }}>
                          {currentLocation.address}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(255,255,255,0.6)' }}>
                          {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)} • ±{currentLocation.accuracy}m
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge ${currentLocation.zone.inZone ? 'badge-success' : 'badge-danger'}`}>
                        {currentLocation.zone.inZone ? `✓ ${currentLocation.zone.zoneName}` : '⚠ Outside Safe Zone'}
                      </span>
                      <a
                        href={getGoogleMapsLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 'var(--font-size-xs)', color: 'var(--accent-teal)' }}
                      >
                        Open in Maps ↗
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
                  background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1420 100%)', flexDirection: 'column', gap: '16px'
                }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Crosshair size={40} style={{ color: 'var(--primary-soft)', opacity: 0.5 }} />
                  </motion.div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    {locationError ? 'Location access denied' : 'Acquiring GPS signal...'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Current Status */}
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '16px' }}>Current Status</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  {
                    icon: <Navigation size={18} />, label: 'Current Location',
                    value: currentLocation?.address || 'Detecting...',
                    color: 'var(--accent-teal)'
                  },
                  {
                    icon: <Shield size={18} />, label: 'Zone Status',
                    value: currentLocation?.zone.inZone
                      ? `Inside ${currentLocation.zone.zoneName} Safe Zone`
                      : currentLocation ? 'Outside all safe zones' : 'Checking...',
                    color: currentLocation?.zone.inZone ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                  },
                  {
                    icon: <Clock size={18} />, label: 'Last Updated',
                    value: getTimeAgo(),
                    color: 'var(--primary-soft)'
                  },
                  {
                    icon: <MapPin size={18} />, label: 'GPS Accuracy',
                    value: currentLocation ? `±${currentLocation.accuracy} meters` : 'N/A',
                    color: 'var(--accent-purple)'
                  },
                  {
                    icon: <Wifi size={18} />, label: 'Coordinates',
                    value: currentLocation
                      ? `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`
                      : 'Waiting...',
                    color: 'var(--accent-emerald)'
                  },
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

            {/* Quick actions */}
            {currentLocation && (
              <div className="card" style={{ background: 'rgba(79, 107, 255, 0.05)', borderColor: 'rgba(79, 107, 255, 0.2)' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <MapPin size={20} style={{ color: 'var(--primary-soft)', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '4px' }}>Live GPS Active</h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      Your location is being tracked in real-time using your device's GPS sensor. Caregivers can monitor your position.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '24px' }}>
            Location History
            <span style={{ fontWeight: 400, fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginLeft: '8px' }}>
              ({locationHistory.length} entries)
            </span>
          </h2>
          {locationHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <MapPin size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>No location history yet. Enable location sharing to start tracking.</p>
            </div>
          ) : (
            <div className="timeline">
              {locationHistory.map((loc, i) => (
                <motion.div
                  key={i}
                  className="timeline-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className={`timeline-dot ${loc.zone.inZone ? 'done' : 'missed'}`} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div className="timeline-time">{loc.time}</div>
                      <div style={{ fontWeight: 600 }}>{loc.address}</div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)} • ±{loc.accuracy}m
                      </div>
                    </div>
                    <span className={`badge ${loc.zone.inZone ? 'badge-success' : 'badge-danger'}`}>
                      {loc.zone.inZone ? `✓ ${loc.zone.zoneName}` : '⚠ Outside'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
            {MOCK_SAFE_ZONES.map((zone, i) => {
              const distance = currentLocation
                ? getDistanceMeters(currentLocation.lat, currentLocation.lng, zone.lat, zone.lng)
                : null;
              return (
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
                        {distance !== null && (
                          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: '2px' }}>
                            📏 {distance < 1000 ? `${Math.round(distance)}m away` : `${(distance / 1000).toFixed(1)}km away`}
                          </p>
                        )}
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
