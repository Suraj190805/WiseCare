'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = '540px' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 500
            }}
          />
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 501,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none', padding: '20px',
            }}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              width: `min(${maxWidth}, calc(100vw - 40px))`,
              maxHeight: 'calc(100vh - 80px)',
              overflowY: 'auto',
              background: 'rgba(17, 24, 39, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--border-radius-lg)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              padding: '28px',
              pointerEvents: 'auto',
            }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-xl)',
                  fontWeight: 700
                }}>{title}</h2>
                {subtitle && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                  borderRadius: '50%', width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0
                }}
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
