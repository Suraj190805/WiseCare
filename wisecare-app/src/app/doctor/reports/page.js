'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, BarChart3, Users, TrendingUp, Filter, CheckCircle2, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/lib/Toast';
import Modal from '@/lib/Modal';

export default function DoctorReportsPage() {
  const { addToast } = useToast();
  const [period, setPeriod] = useState('month');
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportForm, setReportForm] = useState({ type: 'summary', patient: 'all', period: 'month' });

  const adherenceByPatient = [
    { name: 'Rajan K.', adherence: 87 },
    { name: 'Sunita D.', adherence: 92 },
    { name: 'Mohan L.', adherence: 65 },
    { name: 'Kamala R.', adherence: 78 },
  ];

  const riskDistribution = [
    { name: 'Low Risk', value: 1, color: '#10B981' },
    { name: 'Moderate Risk', value: 2, color: '#F59E0B' },
    { name: 'High Risk', value: 1, color: '#F43F5E' },
  ];

  const consultationTrend = [
    { month: 'Jan', count: 12 },
    { month: 'Feb', count: 15 },
    { month: 'Mar', count: 18 },
    { month: 'Apr', count: 8 },
  ];

  const [reportsList, setReportsList] = useState([
    { id: 'rpt1', title: 'Monthly Patient Summary — March 2026', type: 'Summary', date: 'Mar 31, 2026', patients: 4, pages: 12 },
    { id: 'rpt2', title: 'Drug Interaction Audit Report', type: 'Audit', date: 'Mar 28, 2026', patients: 4, pages: 6 },
    { id: 'rpt3', title: 'Adherence Analytics — Q1 2026', type: 'Analytics', date: 'Mar 25, 2026', patients: 4, pages: 8 },
    { id: 'rpt4', title: 'Rajan Kumar — Diabetes Progress Report', type: 'Patient Report', date: 'Mar 25, 2026', patients: 1, pages: 4 },
    { id: 'rpt5', title: 'Mohan Lal — COPD Management Report', type: 'Patient Report', date: 'Mar 22, 2026', patients: 1, pages: 5 },
  ]);

  const handleDownload = (report) => {
    addToast(`📄 Downloading "${report.title}"...`, 'info');
    setTimeout(() => {
      addToast(`✅ "${report.title}" downloaded (${report.pages} pages)`, 'success');
    }, 1500);
  };

  const handleGenerateReport = () => {
    setGenerating(true);
    const reportTypes = {
      summary: 'Monthly Patient Summary',
      adherence: 'Adherence Analytics Report',
      interaction: 'Drug Interaction Audit',
      patient: `${reportForm.patient} — Progress Report`
    };
    const title = reportTypes[reportForm.type] || 'Custom Report';

    setTimeout(() => {
      const newReport = {
        id: `rpt_${Date.now()}`,
        title,
        type: reportForm.type === 'summary' ? 'Summary' : reportForm.type === 'adherence' ? 'Analytics' : reportForm.type === 'interaction' ? 'Audit' : 'Patient Report',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        patients: reportForm.patient === 'all' ? 4 : 1,
        pages: Math.floor(Math.random() * 10) + 4
      };
      setReportsList(prev => [newReport, ...prev]);
      setGenerating(false);
      setShowGenerate(false);
      addToast(`✅ Report "${title}" generated successfully (${newReport.pages} pages)`, 'success');
    }, 2500);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-description">Generate and download clinical reports</p>
          </div>
          <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={() => setShowGenerate(true)}>
            <FileText size={18} /> Generate Report
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card primary">
          <div className="stat-icon primary"><Users size={22} /></div>
          <div className="stat-value">4</div>
          <div className="stat-label">Active Patients</div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon teal"><BarChart3 size={22} /></div>
          <div className="stat-value">80.5%</div>
          <div className="stat-label">Avg Adherence</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Calendar size={22} /></div>
          <div className="stat-value">18</div>
          <div className="stat-label">Consults This Month</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><TrendingUp size={22} /></div>
          <div className="stat-value">+12%</div>
          <div className="stat-label">Adherence Improvement</div>
        </div>
      </div>

      {/* Period Tabs */}
      <div className="pill-tabs" style={{ marginBottom: '24px' }}>
        {['week', 'month', 'quarter'].map(p => (
          <button key={p} className={`pill-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid-2">
        {/* Adherence Chart */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Patient Adherence Comparison</h2>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adherenceByPatient} layout="vertical">
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} width={80} />
                <Tooltip
                  contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }}
                  formatter={(v) => [`${v}%`, 'Adherence']}
                />
                <Bar dataKey="adherence" radius={[0, 8, 8, 0]} fill="#4F6BFF" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Risk Distribution</h2>
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%" cy="50%"
                  innerRadius={70} outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
            {riskDistribution.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Consultation Trend */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Consultation Trend (2026)</h2>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consultationTrend}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#2DD4BF" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Downloadable Reports */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Generated Reports ({reportsList.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
            {reportsList.map((rpt, i) => (
              <motion.div
                key={rpt.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', background: 'var(--bg-elevated)',
                  borderRadius: 'var(--border-radius-sm)', flexWrap: 'wrap', gap: '8px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{rpt.title}</div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{rpt.date}</span>
                    <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>{rpt.type}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{rpt.pages} pages</span>
                  </div>
                </div>
                <motion.button
                  className="btn btn-ghost btn-sm"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownload(rpt)}
                  style={{ padding: '6px 12px', minHeight: 'unset' }}
                >
                  <Download size={14} /> PDF
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      <Modal isOpen={showGenerate} onClose={() => !generating && setShowGenerate(false)} title="Generate Report" subtitle="Create a new clinical report">
        {!generating ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div className="input-group">
              <label className="input-label">Report Type</label>
              <select className="input" value={reportForm.type} onChange={(e) => setReportForm(prev => ({ ...prev, type: e.target.value }))} style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                <option value="summary">Monthly Patient Summary</option>
                <option value="adherence">Adherence Analytics</option>
                <option value="interaction">Drug Interaction Audit</option>
                <option value="patient">Individual Patient Report</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Patient</label>
              <select className="input" value={reportForm.patient} onChange={(e) => setReportForm(prev => ({ ...prev, patient: e.target.value }))} style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                <option value="all">All Patients</option>
                <option value="Rajan Kumar">Rajan Kumar</option>
                <option value="Sunita Devi">Sunita Devi</option>
                <option value="Mohan Lal">Mohan Lal</option>
                <option value="Kamala Rao">Kamala Rao</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Period</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['week', 'month', 'quarter'].map(p => (
                  <motion.button
                    key={p}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setReportForm(prev => ({ ...prev, period: p }))}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 'var(--border-radius-sm)',
                      border: `2px solid ${reportForm.period === p ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: reportForm.period === p ? 'var(--primary-glow)' : 'var(--bg-elevated)',
                      color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'center',
                      fontWeight: 600, fontSize: 'var(--font-size-sm)', textTransform: 'capitalize'
                    }}
                  >
                    {p}
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={handleGenerateReport} style={{ width: '100%' }}>
              <FileText size={18} /> Generate Report
            </motion.button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 size={48} style={{ color: 'var(--primary)' }} />
            </motion.div>
            <h3 style={{ marginTop: '20px', fontWeight: 600 }}>Generating Report...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '8px' }}>
              Analyzing patient data and creating your report
            </p>
            <div className="progress-bar" style={{ marginTop: '24px', width: '60%', margin: '24px auto 0' }}>
              <motion.div
                className="progress-fill primary"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
