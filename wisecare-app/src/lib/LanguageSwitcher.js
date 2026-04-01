'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function LanguageSwitcher({ compact = false }) {
  const { language, changeLanguage, t, languages } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = languages.find(l => l.code === language) || languages[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: compact ? '6px 10px' : '8px 14px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--border-radius-full)',
          cursor: 'pointer', color: 'var(--text-primary)',
          fontSize: 'var(--font-size-sm)', fontWeight: 500,
          transition: 'all 0.2s ease',
        }}
      >
        <Globe size={compact ? 14 : 16} style={{ color: 'var(--primary-soft)' }} />
        {!compact && <span>{current.native}</span>}
        <ChevronDown size={14} style={{
          transform: open ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s ease',
          color: 'var(--text-muted)'
        }} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: '100%', right: 0,
              marginTop: '8px', minWidth: '220px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--border-radius)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
              overflow: 'hidden', zIndex: 300,
            }}
          >
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-muted)', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {t('lang.select')}
            </div>

            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ backgroundColor: 'rgba(79, 107, 255, 0.08)' }}
                onClick={() => { changeLanguage(lang.code); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  width: '100%', padding: '12px 16px',
                  background: language === lang.code ? 'rgba(79, 107, 255, 0.06)' : 'transparent',
                  border: 'none', borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer', color: 'var(--text-primary)',
                  textAlign: 'left', fontSize: 'var(--font-size-sm)',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{lang.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: language === lang.code ? 600 : 400 }}>
                    {lang.native}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {lang.name}
                  </div>
                </div>
                {language === lang.code && (
                  <Check size={16} style={{ color: 'var(--primary-soft)' }} />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
