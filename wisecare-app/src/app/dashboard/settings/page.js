'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Globe, Moon, Sun, Eye, Volume2,
  Shield, Smartphone, Heart, User, ChevronRight,
  ToggleLeft, ToggleRight, Save, Check
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    soundAlerts: true,
    darkMode: true,
    highContrast: false,
    largeText: true,
    autoSOS: true,
    locationSharing: true,
    voiceAssistant: true,
    language: 'en-IN',
    fontSize: '18',
    sosDelay: '10',
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ value, onChange }) => (
    <motion.button
      onClick={onChange}
      whileTap={{ scale: 0.9 }}
      style={{
        width: '52px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
        background: value ? 'var(--accent-emerald)' : 'var(--bg-elevated)',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        style={{
          width: '24px', height: '24px', borderRadius: '50%', background: 'white',
          position: 'absolute', top: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      />
    </motion.button>
  );

  const SettingRow = ({ icon, label, description, children }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '20px 0', borderBottom: '1px solid var(--border-subtle)',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flex: 1 }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '10px', background: 'var(--bg-elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-soft)',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{label}</div>
          {description && <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{description}</div>}
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-description">Customize your CareCompanion experience</p>
          </div>
          <motion.button
            className={`btn ${saved ? 'btn-teal' : 'btn-primary'}`}
            onClick={handleSave}
            whileTap={{ scale: 0.97 }}
          >
            {saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
          </motion.button>
        </div>
      </div>

      <div className="grid-2">
        {/* Accessibility */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Eye size={20} style={{ color: 'var(--primary-soft)' }} />
            <h2 className="card-title">Accessibility</h2>
          </div>
          <p className="card-subtitle" style={{ marginBottom: '8px' }}>WCAG 2.1 AA compliant settings</p>

          <SettingRow icon={<Sun size={18} />} label="Large Text Mode" description="Minimum 18pt font size (recommended)">
            <Toggle value={settings.largeText} onChange={() => handleToggle('largeText')} />
          </SettingRow>

          <SettingRow icon={<Eye size={18} />} label="High Contrast" description="Enhanced color contrast for readability">
            <Toggle value={settings.highContrast} onChange={() => handleToggle('highContrast')} />
          </SettingRow>

          <SettingRow icon={<Moon size={18} />} label="Dark Mode" description="Reduce eye strain in low light">
            <Toggle value={settings.darkMode} onChange={() => handleToggle('darkMode')} />
          </SettingRow>

          <SettingRow icon={<Globe size={18} />} label="Language" description="Voice & text language">
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--border-radius-sm)', padding: '8px 12px',
                color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', cursor: 'pointer',
              }}
            >
              <option value="en-IN">English</option>
              <option value="hi-IN">हिन्दी</option>
              <option value="kn-IN">ಕನ್ನಡ</option>
              <option value="ta-IN">தமிழ்</option>
              <option value="te-IN">తెలుగు</option>
            </select>
          </SettingRow>

          <SettingRow icon={<Settings size={18} />} label="Font Size" description="Adjust base text size">
            <select
              value={settings.fontSize}
              onChange={(e) => setSettings(prev => ({ ...prev, fontSize: e.target.value }))}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--border-radius-sm)', padding: '8px 12px',
                color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', cursor: 'pointer',
              }}
            >
              <option value="16">16px</option>
              <option value="18">18px (Default)</option>
              <option value="20">20px</option>
              <option value="22">22px (Extra Large)</option>
            </select>
          </SettingRow>
        </div>

        {/* Notifications */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Bell size={20} style={{ color: 'var(--accent-amber)' }} />
            <h2 className="card-title">Notifications & Alerts</h2>
          </div>
          <p className="card-subtitle" style={{ marginBottom: '8px' }}>Configure how you receive alerts</p>

          <SettingRow icon={<Bell size={18} />} label="Push Notifications" description="Receive alerts on your device">
            <Toggle value={settings.notifications} onChange={() => handleToggle('notifications')} />
          </SettingRow>

          <SettingRow icon={<Volume2 size={18} />} label="Sound Alerts" description="Audible medication & SOS alerts">
            <Toggle value={settings.soundAlerts} onChange={() => handleToggle('soundAlerts')} />
          </SettingRow>

          <SettingRow icon={<Heart size={18} />} label="Auto SOS Detection" description="Trigger SOS on fall detection">
            <Toggle value={settings.autoSOS} onChange={() => handleToggle('autoSOS')} />
          </SettingRow>

          <SettingRow icon={<Settings size={18} />} label="SOS Countdown" description="Seconds before alert is sent">
            <select
              value={settings.sosDelay}
              onChange={(e) => setSettings(prev => ({ ...prev, sosDelay: e.target.value }))}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--border-radius-sm)', padding: '8px 12px',
                color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', cursor: 'pointer',
              }}
            >
              <option value="5">5 seconds</option>
              <option value="10">10 seconds (Default)</option>
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
            </select>
          </SettingRow>
        </div>

        {/* Privacy */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Shield size={20} style={{ color: 'var(--accent-emerald)' }} />
            <h2 className="card-title">Privacy & Security</h2>
          </div>
          <p className="card-subtitle" style={{ marginBottom: '8px' }}>DPDP Act compliant data handling</p>

          <SettingRow icon={<Shield size={18} />} label="Location Sharing" description="Share real-time location with caregivers">
            <Toggle value={settings.locationSharing} onChange={() => handleToggle('locationSharing')} />
          </SettingRow>

          <SettingRow icon={<Smartphone size={18} />} label="Voice Assistant" description="Enable AI voice companion">
            <Toggle value={settings.voiceAssistant} onChange={() => handleToggle('voiceAssistant')} />
          </SettingRow>

          <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <Shield size={16} style={{ color: 'var(--accent-emerald)' }} />
              <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--accent-emerald)' }}>Data Protection</span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your health data is encrypted using AES-256 encryption and stored in compliance with 
              India's Digital Personal Data Protection (DPDP) Act. We never share your data with 
              third parties without explicit consent.
            </p>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Heart size={20} style={{ color: 'var(--accent-rose)' }} />
            <h2 className="card-title">About CareCompanion</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px' }}>
            {[
              { label: 'Version', value: '1.0.0 (MVP)' },
              { label: 'Platform', value: 'Web Application (Next.js)' },
              { label: 'AI Engine', value: 'OpenAI GPT-4o' },
              { label: 'Voice', value: 'Web Speech API (10+ languages)' },
              { label: 'Compliance', value: 'WCAG 2.1 AA, DPDP Act' },
              { label: 'Security', value: 'AES-256, TLS 1.3' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>{item.label}</span>
                <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              Built with ❤️ for India's elderly • Hackathon MVP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
