'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed', top: '88px', right: '24px', zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px'
      }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const config = {
    success: { icon: <CheckCircle2 size={20} />, color: 'var(--accent-emerald)', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
    error: { icon: <AlertTriangle size={20} />, color: 'var(--accent-rose)', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.3)' },
    warning: { icon: <AlertTriangle size={20} />, color: 'var(--accent-amber)', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
    info: { icon: <Info size={20} />, color: 'var(--primary-soft)', bg: 'rgba(79, 107, 255, 0.12)', border: 'rgba(79, 107, 255, 0.3)' },
  }[toast.type] || { icon: <Info size={20} />, color: 'var(--primary-soft)', bg: 'rgba(79, 107, 255, 0.12)', border: 'rgba(79, 107, 255, 0.3)' };

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 18px',
        background: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${config.border}`,
        borderLeft: `4px solid ${config.color}`,
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        color: 'var(--text-primary)',
        fontSize: 'var(--font-size-sm)',
        minWidth: '300px',
      }}
    >
      <span style={{ color: config.color, flexShrink: 0 }}>{config.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{toast.message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', padding: '4px', flexShrink: 0
        }}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
