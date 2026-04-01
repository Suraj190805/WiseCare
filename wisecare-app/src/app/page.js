'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Mic, Shield, Bell, MapPin, Video, Activity } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    { icon: <Mic size={28} />, title: 'AI Voice Companion', desc: 'Natural voice interaction in 10+ languages', color: 'var(--accent-teal)', bg: 'var(--accent-teal-soft)' },
    { icon: <Bell size={28} />, title: 'Smart Reminders', desc: 'Never miss a medication or appointment', color: 'var(--primary)', bg: 'var(--primary-glow)' },
    { icon: <Shield size={28} />, title: 'Emergency SOS', desc: 'One-tap alert to family & emergency services', color: 'var(--accent-rose)', bg: 'var(--accent-rose-soft)' },
    { icon: <MapPin size={28} />, title: 'Live Location', desc: 'Real-time GPS with safe zone alerts', color: 'var(--accent-amber)', bg: 'var(--accent-amber-soft)' },
    { icon: <Video size={28} />, title: 'Video Consults', desc: 'Secure video calls with your doctor', color: 'var(--accent-purple)', bg: 'var(--accent-purple-soft)' },
    { icon: <Activity size={28} />, title: 'Health Monitoring', desc: 'Track vitals, activity & wellness trends', color: 'var(--accent-emerald)', bg: 'var(--accent-emerald-soft)' },
  ];

  const stats = [
    { value: '140M+', label: 'Elderly Indians', sub: 'who need care support' },
    { value: '85%', label: 'Adherence Goal', sub: 'from 50% baseline' },
    { value: '<30s', label: 'SOS Response', sub: 'emergency alert delivery' },
    { value: '10+', label: 'Languages', sub: 'regional voice support' },
  ];

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Animated Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,107,255,0.08) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.06) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)', filter: 'blur(80px)', transform: 'translate(-50%, -50%)' }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10, 14, 26, 0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary), var(--accent-teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🩺</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>CareCompanion AI</span>
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={() => router.push('/login')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ padding: '10px 24px', minHeight: '44px' }}
        >
          Get Started <ArrowRight size={18} />
        </motion.button>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 60px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ maxWidth: '800px' }}
        >
          <motion.div
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'var(--primary-glow)', border: '1px solid var(--border-accent)', borderRadius: 'var(--border-radius-full)', marginBottom: '24px', fontSize: 'var(--font-size-sm)', color: 'var(--primary-soft)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Heart size={16} fill="currentColor" /> AI-Driven Healthcare Hackathon 2025
          </motion.div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
            Compassionate AI Care
            <br />
            <span style={{ background: 'linear-gradient(135deg, var(--primary-soft), var(--accent-teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              for Every Elder
            </span>
          </h1>

          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            Voice-first health companion that empowers elderly individuals to live independently with smart medication management, emergency response, and seamless family connectivity.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={() => router.push('/login')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Using CareCompanion <ArrowRight size={20} />
            </motion.button>
            <motion.button
              className="btn btn-ghost btn-lg"
              onClick={() => router.push('/login')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Watch Demo
            </motion.button>
          </div>
        </motion.div>

        {/* Floating badges */}
        <motion.div
          style={{ position: 'absolute', top: '25%', left: '8%', padding: '12px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--font-size-sm)' }}
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-emerald-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={18} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>72 BPM</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Heart Rate</div>
          </div>
        </motion.div>

        <motion.div
          style={{ position: 'absolute', top: '35%', right: '8%', padding: '12px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--font-size-sm)' }}
          animate={{ y: [5, -5, 5] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-teal-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={18} style={{ color: 'var(--accent-teal)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>Medication Due</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Metformin 500mg</div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 32px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="stat-grid">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center', padding: '32px 20px' }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800, background: 'linear-gradient(135deg, var(--primary-soft), var(--accent-teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {stat.value}
              </div>
              <div style={{ fontWeight: 600, marginTop: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{stat.sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 32px 100px', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: '12px' }}>
            Everything Your Loved One Needs
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            Comprehensive care platform designed with empathy, powered by AI
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', cursor: 'pointer' }}
              whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
            >
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-base)', marginBottom: '4px' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 32px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          className="card-glow"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={{ padding: '60px 40px' }}
        >
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: '16px' }}>
            Ready to Give Your Family <br />Peace of Mind?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
            Join thousands of families using CareCompanion AI to keep their elders safe, healthy, and connected.
          </p>
          <motion.button
            className="btn btn-primary btn-lg"
            onClick={() => router.push('/login')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started Free <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, padding: '40px 32px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>🩺</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>CareCompanion AI</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
          Built with ❤️ for AI-Driven Healthcare Hackathon 2025 — Empowering Elderly Independence
        </p>
      </footer>
    </div>
  );
}
