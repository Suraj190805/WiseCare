'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Calendar, FileText, AlertTriangle,
  ClipboardList, LogOut, Menu, X, Bell, Search
} from 'lucide-react';
import { MOCK_USERS, MOCK_ALERTS } from '@/lib/mockData';
import { ToastProvider } from '@/lib/Toast';
import { useLanguage } from '@/lib/LanguageContext';
import CrossRoleMessaging from '@/lib/CrossRoleMessaging';
import LanguageSwitcher from '@/lib/LanguageSwitcher';

export default function DoctorLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  const user = MOCK_USERS.doctor;
  const unreadAlerts = alerts.filter(a => !a.read).length;

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/doctor', icon: LayoutDashboard, label: t('nav.dashboard') },
    { href: '/doctor/patients', icon: Users, label: t('nav.patients'), badge: '4' },
    { href: '/doctor/appointments', icon: Calendar, label: t('nav.appointments') },
    { href: '/doctor/records', icon: FileText, label: t('nav.records') },
    { href: '/doctor/interactions', icon: AlertTriangle, label: t('nav.interactions'), badge: '2' },
    { href: '/doctor/reports', icon: ClipboardList, label: t('nav.reports') },
  ];

  const isActive = (href) => {
    if (href === '/doctor') return pathname === '/doctor';
    return pathname.startsWith(href);
  };

  const getPageTitle = () => {
    const route = navItems.find(item => isActive(item.href));
    return route ? route.label : 'Doctor Dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('carecompanion_user');
    router.push('/login');
  };

  const markNotificationsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.key === 'Enter' && e.target.value.trim()) {
      router.push(`/doctor/patients?search=${encodeURIComponent(e.target.value.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <ToastProvider>
      <div className="app-layout">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={sidebarOpen ? { transform: 'translateX(0)' } : {}}>
          <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🩺</div>
          <div>
            <div className="sidebar-logo-text">{t('brand.name')}</div>
            <div className="sidebar-logo-sub">{t('brand.doctorPortal')}</div>
          </div>
        </div>

          <nav className="sidebar-nav">
            <div className="sidebar-section-label">{t('nav.clinical')}</div>
          {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-item-badge">{item.badge}</span>}
              </Link>
            ))}

            <div className="sidebar-section-label" style={{ marginTop: '16px' }}>{t('nav.account')}</div>
          <div className="nav-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <LogOut size={20} /> <span>{t('nav.logout')}</span>
          </div>
          </nav>

          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{ background: 'linear-gradient(135deg, var(--accent-rose), var(--primary))' }}>{user.avatar}</div>
            <div>
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">{user.specialization} • {user.licenseNo}</div>
            </div>
          </div>
        </aside>

        <header className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <h1 className="header-title">{getPageTitle()}</h1>
          </div>
          <div className="header-actions">
            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px',
              background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-full)',
              border: '1px solid var(--border-subtle)', minWidth: '200px'
            }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                placeholder={t('header.searchPatients')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)', outline: 'none', width: '100%'
                }}
              />
            </div>

            {/* Notifications */}
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
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{t('header.notifications')}</span>
                      {unreadAlerts > 0 && (
                        <button
                          onClick={markNotificationsRead}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-soft)', cursor: 'pointer', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}
                        >
                          {t('header.markAllRead')}
                        </button>
                      )}
                    </div>
                    {alerts.slice(0, 4).map(alert => (
                      <div key={alert.id} style={{
                        padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
                        display: 'flex', gap: '12px', alignItems: 'flex-start',
                        background: !alert.read ? 'rgba(79, 107, 255, 0.05)' : 'transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, read: true } : a))}
                      >
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%', marginTop: '8px', flexShrink: 0,
                          background: alert.severity === 'danger' ? 'var(--accent-rose)' :
                            alert.severity === 'warning' ? 'var(--accent-amber)' : 'var(--primary-soft)'
                        }} />
                        <div>
                          <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.4, fontWeight: !alert.read ? 600 : 400 }}>{alert.message}</div>
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
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-rose), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                {user.avatar}
              </div>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{user.name}</span>
            </div>
          </div>
        </header>

        <main className="main-content" onClick={() => setShowNotifications(false)}>
          {children}
        </main>
        <CrossRoleMessaging currentRole="doctor" />
      </div>
    </ToastProvider>
  );
}
