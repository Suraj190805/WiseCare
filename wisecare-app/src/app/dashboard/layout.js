'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Pill, UtensilsCrossed, MessageCircle,
  AlertTriangle, MapPin, Calendar, Settings, LogOut,
  Menu, X, Bell, Phone
} from 'lucide-react';
import { MOCK_USERS, MOCK_ALERTS, getGreeting } from '@/lib/mockData';
import { ToastProvider } from '@/lib/Toast';
import { useLanguage } from '@/lib/LanguageContext';
import CrossRoleMessaging from '@/lib/CrossRoleMessaging';
import LanguageSwitcher from '@/lib/LanguageSwitcher';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useLanguage();
  const user = MOCK_USERS.patient;
  const unreadAlerts = MOCK_ALERTS.filter(a => !a.read).length;

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: '/dashboard/medications', icon: Pill, label: t('nav.medications'), badge: '3' },
    { href: '/dashboard/diet', icon: UtensilsCrossed, label: t('nav.diet') },
    { href: '/dashboard/chat', icon: MessageCircle, label: t('nav.chat') },
    { href: '/dashboard/emergency', icon: AlertTriangle, label: t('nav.emergency') },
    { href: '/dashboard/location', icon: MapPin, label: t('nav.location') },
    { href: '/dashboard/appointments', icon: Calendar, label: t('nav.appointments') },
  ];

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    const route = navItems.find(item => isActive(item.href));
    return route ? route.label : 'Dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('carecompanion_user');
    router.push('/login');
  };

  return (
    <ToastProvider>
    <div className="app-layout">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ display: 'block', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={sidebarOpen ? { transform: 'translateX(0)' } : {}}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🩺</div>
          <div>
            <div className="sidebar-logo-text">{t('brand.name')}</div>
            <div className="sidebar-logo-sub">{t('brand.tagline')}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">{t('nav.mainMenu')}</div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
            >
              <item.icon size={20} className="nav-item-icon" />
              <span>{item.label}</span>
              {item.badge && <span className="nav-item-badge">{item.badge}</span>}
            </Link>
          ))}

          <div className="sidebar-section-label" style={{ marginTop: '16px' }}>{t('nav.settings')}</div>
          <Link href="/dashboard/settings" className={`nav-item ${pathname === '/dashboard/settings' ? 'active' : ''}`}>
            <Settings size={20} className="nav-item-icon" />
            <span>{t('nav.settings')}</span>
          </Link>
          <div className="nav-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <LogOut size={20} className="nav-item-icon" />
            <span>{t('nav.logout')}</span>
          </div>
        </nav>

        {/* SOS Quick Access */}
        <div style={{ padding: '12px', marginBottom: '8px' }}>
          <Link href="/dashboard/emergency">
            <motion.button
              className="btn btn-danger w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%', gap: '8px' }}
            >
              <Phone size={18} />
              {t('btn.emergencySOS')}
            </motion.button>
          </Link>
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user.avatar}</div>
          <div>
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">Patient • Age {user.age}</div>
          </div>
        </div>
      </aside>

      {/* Header */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div>
            <h1 className="header-title">{getPageTitle()}</h1>
          </div>
        </div>

        <div className="header-actions">
          <div style={{ position: 'relative' }}>
            <motion.button
              className="btn btn-icon btn-ghost sm"
              onClick={() => setShowNotifications(!showNotifications)}
              whileTap={{ scale: 0.9 }}
              style={{ position: 'relative' }}
            >
              <Bell size={20} />
              {unreadAlerts > 0 && (
                <span style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-rose)', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {unreadAlerts}
                </span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  style={{
                    position: 'absolute', top: '52px', right: 0, width: '360px',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-default)',
                    borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden', zIndex: 200
                  }}
                >
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600 }}>
                    {t('header.notifications')}
                  </div>
                  {MOCK_ALERTS.slice(0, 4).map(alert => (
                    <div key={alert.id} style={{
                      padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                      background: !alert.read ? 'rgba(79, 107, 255, 0.05)' : 'transparent'
                    }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%', marginTop: '8px', flexShrink: 0,
                        background: alert.severity === 'danger' ? 'var(--accent-rose)' :
                          alert.severity === 'warning' ? 'var(--accent-amber)' : 'var(--primary-soft)'
                      }} />
                      <div>
                        <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.4 }}>{alert.message}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>{alert.time}</div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <LanguageSwitcher compact />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px 6px 6px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent-teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
              {user.avatar}
            </div>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content" onClick={() => { setShowNotifications(false); }}>
        {children}
      </main>
      <CrossRoleMessaging currentRole="patient" />
    </div>
    </ToastProvider>
  );
}
