'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Stethoscope, Users, Shield, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSwitcher from '@/lib/LanguageSwitcher';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState(null);
  const [pin, setPin] = useState(['', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { id: 'patient', label: t('login.patient'), icon: '👴', desc: 'Elderly User', color: 'var(--accent-teal)' },
    { id: 'caregiver', label: t('login.caregiver'), icon: '👨‍👩‍👧', desc: 'Family Member', color: 'var(--accent-purple)' },
    { id: 'doctor', label: t('login.doctor'), icon: '👨‍⚕️', desc: 'Medical Professional', color: 'var(--primary)' },
  ];

  const handlePinInput = (index, value) => {
    if (value.length > 1) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      const next = document.getElementById(`pin-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prev = document.getElementById(`pin-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handleNumpadClick = (num) => {
    const emptyIndex = pin.findIndex(d => d === '');
    if (emptyIndex !== -1) {
      handlePinInput(emptyIndex, num.toString());
    }
  };

  const handleNumpadDelete = () => {
    const lastFilledIndex = pin.reduce((acc, d, i) => d !== '' ? i : acc, -1);
    if (lastFilledIndex !== -1) {
      const newPin = [...pin];
      newPin[lastFilledIndex] = '';
      setPin(newPin);
    }
  };

  useEffect(() => {
    const fullPin = pin.join('');
    if (fullPin.length === 4) {
      handleLogin();
    }
  }, [pin]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 1000));

    if (selectedRole === 'patient') {
      const fullPin = pin.join('');
      if (fullPin === '1234') {
        localStorage.setItem('carecompanion_user', JSON.stringify({ role: 'patient' }));
        router.push('/dashboard');
        return;
      }
      setError('Invalid PIN. Try 1234 for demo.');
      setPin(['', '', '', '']);
      setIsLoading(false);
    } else if (selectedRole === 'doctor') {
      localStorage.setItem('carecompanion_user', JSON.stringify({ role: 'doctor' }));
      router.push('/doctor');
    } else if (selectedRole === 'caregiver') {
      localStorage.setItem('carecompanion_user', JSON.stringify({ role: 'caregiver' }));
      router.push('/caregiver');
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Ambient background orbs */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,107,255,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '15%', width: '350px', height: '350px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)', animation: 'float 10s ease-in-out infinite reverse'
        }} />
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
      `}</style>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <motion.div
              className="auth-logo-icon"
              animate={{ boxShadow: ['0 8px 32px rgba(79, 107, 255, 0.3)', '0 8px 32px rgba(45, 212, 191, 0.3)', '0 8px 32px rgba(79, 107, 255, 0.3)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🩺
            </motion.div>
            <h1 className="auth-title">CareCompanion AI</h1>
            <p className="auth-subtitle">{t('login.subtitle')}</p>
          </div>

          {/* Language switcher on login */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <LanguageSwitcher />
          </div>

          <AnimatePresence mode="wait">
            {!selectedRole ? (
              /* Role Selection */
              <motion.div
                key="role-select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: 'var(--font-size-sm)' }}>
                  {t('login.subtitle')}
                </p>
                <div className="role-selector">
                  {roles.map((role) => (
                    <motion.div
                      key={role.id}
                      className="role-card"
                      onClick={() => setSelectedRole(role.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <div className="role-icon" style={{ background: `${role.color}15`, fontSize: '2rem' }}>
                        {role.icon}
                      </div>
                      <span className="role-name">{role.label}</span>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{role.desc}</span>
                    </motion.div>
                  ))}
                </div>

                <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Shield size={20} style={{ color: 'var(--accent-teal)', flexShrink: 0 }} />
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Your data is encrypted (AES-256) and DPDP compliant. We never share your health data with third parties.
                  </p>
                </div>
              </motion.div>
            ) : selectedRole === 'patient' ? (
              /* Patient PIN Login */
              <motion.div
                key="pin-login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => { setSelectedRole(null); setPin(['', '', '', '']); setError(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '24px', fontSize: 'var(--font-size-sm)', padding: 0 }}
                >
                  <ChevronLeft size={18} /> Back
                </button>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>Enter your PIN</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Use your 4-digit security PIN</p>
                </div>

                {/* PIN dots */}
                <div className="pin-container" style={{ marginBottom: '8px' }}>
                  {pin.map((digit, i) => (
                    <input
                      key={i}
                      id={`pin-${i}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinInput(i, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(i, e)}
                      className="pin-digit"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ color: 'var(--accent-rose)', textAlign: 'center', fontSize: 'var(--font-size-sm)', marginBottom: '16px' }}
                  >
                    {error}
                  </motion.p>
                )}

                {/* Numpad */}
                <div className="numpad" style={{ marginTop: '24px' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <motion.button
                      key={num}
                      className="numpad-key"
                      onClick={() => handleNumpadClick(num)}
                      whileTap={{ scale: 0.9 }}
                    >
                      {num}
                    </motion.button>
                  ))}
                  <div /> {/* empty cell */}
                  <motion.button
                    className="numpad-key"
                    onClick={() => handleNumpadClick(0)}
                    whileTap={{ scale: 0.9 }}
                  >
                    0
                  </motion.button>
                  <motion.button
                    className="numpad-key action"
                    onClick={handleNumpadDelete}
                    whileTap={{ scale: 0.9 }}
                    style={{ fontSize: 'var(--font-size-lg)' }}
                  >
                    ⌫
                  </motion.button>
                </div>

                {isLoading && (
                  <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
                    Verifying...
                  </div>
                )}

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Demo PIN: <strong style={{ color: 'var(--accent-teal)' }}>1234</strong>
                </p>
              </motion.div>
            ) : (
              /* Doctor/Caregiver Email Login */
              <motion.div
                key="email-login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => { setSelectedRole(null); setError(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '24px', fontSize: 'var(--font-size-sm)', padding: 0 }}
                >
                  <ChevronLeft size={18} /> Back
                </button>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>
                    {selectedRole === 'doctor' ? '👨‍⚕️ Doctor Login' : '👨‍👩‍👧 Caregiver Login'}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    Enter your credentials to continue
                  </p>
                </div>

                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="doctor@hospital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="input-group" style={{ marginBottom: '24px' }}>
                  <label className="input-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingRight: '50px' }}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ color: 'var(--accent-rose)', fontSize: 'var(--font-size-sm)', marginBottom: '16px' }}
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  className="btn btn-primary w-full"
                  onClick={handleLogin}
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  style={{ width: '100%' }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                  {!isLoading && <ArrowRight size={18} />}
                </motion.button>

                <p style={{ textAlign: 'center', marginTop: '16px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Any email/password works for demo
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
