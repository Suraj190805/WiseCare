'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, Calendar, Activity, Pill, Eye, ChevronRight, X, CheckCircle2, Clock, Upload } from 'lucide-react';
import { useToast } from '@/lib/Toast';
import Modal from '@/lib/Modal';

export default function DoctorRecordsPage() {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('all');
  const [viewingRecord, setViewingRecord] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ patient: '', type: 'Lab Report', title: '', summary: '' });

  const [records, setRecords] = useState([
    { id: 'r1', patient: 'Rajan Kumar', avatar: 'RK', type: 'Lab Report', title: 'HbA1c Test Results', date: 'Mar 28, 2026', status: 'reviewed', summary: 'HbA1c: 7.2% (improved from 7.8%). Fasting glucose: 142 mg/dL. Kidney function normal.', details: 'Full Panel Results:\n• HbA1c: 7.2% (prev: 7.8%)\n• Fasting Glucose: 142 mg/dL\n• Post-meal Glucose: 185 mg/dL\n• Creatinine: 0.9 mg/dL (normal)\n• eGFR: 82 mL/min (normal)\n• Lipid Panel: Total Cholesterol 195, HDL 48, LDL 120, Triglycerides 150\n\nInterpretation: Glycemic control improving. Continue current Metformin dosage. Recheck in 3 months.' },
    { id: 'r2', patient: 'Rajan Kumar', avatar: 'RK', type: 'Prescription', title: 'Monthly Prescription Update', date: 'Mar 25, 2026', status: 'active', summary: 'Metformin 500mg (2x daily), Amlodipine 5mg (1x), Atorvastatin 10mg (1x night), Aspirin 75mg (1x).', details: 'Current Prescription:\n\n1. Metformin 500mg — Twice daily with meals (AM/PM)\n2. Amlodipine 5mg — Once daily, morning\n3. Atorvastatin 10mg — Once daily, bedtime\n4. Aspirin 75mg — Once daily, after breakfast\n\nDuration: 30 days\nNext review: April 25, 2026\n\nSpecial Instructions:\n• Monitor fasting blood sugar weekly\n• Report any muscle pain (statin side effect)\n• Maintain low-sodium diet' },
    { id: 'r3', patient: 'Mohan Lal', avatar: 'ML', type: 'Lab Report', title: 'Spirometry Results', date: 'Mar 22, 2026', status: 'pending', summary: 'FEV1/FVC ratio: 0.62 (moderate obstruction). Recommended bronchodilator adjustment.', details: 'Spirometry Report:\n\n• FVC: 3.2L (78% predicted)\n• FEV1: 1.98L (65% predicted)\n• FEV1/FVC: 0.62 (moderate obstruction)\n• PEF: 4.5 L/s\n• Post-bronchodilator FEV1: 2.15L (+8.6%)\n\nInterpretation: Moderate airflow obstruction with partial reversibility. Suggesting COPD Stage II. Recommend adjusting bronchodilator therapy and adding inhaled corticosteroid.' },
    { id: 'r4', patient: 'Sunita Devi', avatar: 'SD', type: 'Clinical Notes', title: 'Hypertension Management Review', date: 'Mar 20, 2026', status: 'reviewed', summary: 'BP readings averaging 135/85. Added Telmisartan 40mg. Follow-up in 2 weeks.', details: 'Clinical Notes:\n\nChief Complaint: Persistent elevated blood pressure despite lifestyle modifications.\n\nVital Signs: BP 138/86, HR 76, Temp 98.4°F\n\nPlan:\n1. Started Telmisartan 40mg once daily\n2. Continue low-sodium diet\n3. Daily BP monitoring at home\n4. Follow-up in 2 weeks\n5. If no improvement, consider combination therapy' },
    { id: 'r5', patient: 'Kamala Rao', avatar: 'KR', type: 'Lab Report', title: 'Echocardiogram Report', date: 'Mar 15, 2026', status: 'reviewed', summary: 'Ejection fraction: 55% (normal). No valve abnormalities. Mild LV hypertrophy.', details: 'Echocardiogram Report:\n\n• LVEF: 55% (normal ≥55%)\n• LV dimensions: Mildly dilated\n• Wall motion: Normal\n• Valves: No significant stenosis or regurgitation\n• Mild LV hypertrophy (wall thickness 1.2cm)\n• No pericardial effusion\n• Diastolic function: Grade I (impaired relaxation)\n\nConclusion: Preserved systolic function. Mild LVH consistent with chronic hypertension. Continue current cardiac medications.' },
    { id: 'r6', patient: 'Rajan Kumar', avatar: 'RK', type: 'Vitals Log', title: '7-Day Vitals Summary', date: 'Mar 14, 2026', status: 'reviewed', summary: 'HR avg: 72 bpm, BP avg: 128/82, Blood sugar trending down. SpO2 stable at 97%.', details: '7-Day Vitals Summary:\n\nHeart Rate: Avg 72 bpm (Range: 68-78)\nBlood Pressure: Avg 128/82 (Range: 124/78 - 132/86)\nBlood Sugar (Fasting): Avg 145 mg/dL (Trend: ↓)\nBlood Sugar (Post-meal): Avg 182 mg/dL (Trend: ↓)\nSpO2: Avg 97% (Stable)\nWeight: 72 kg (Stable)\nTemperature: 98.2°F (Normal)\n\nNotes: All vitals within acceptable ranges. Blood sugar showing positive downward trend. Continue current management.' },
  ]);

  const typeIcon = (type) => {
    if (type === 'Lab Report') return <Activity size={18} />;
    if (type === 'Prescription') return <Pill size={18} />;
    if (type === 'Vitals Log') return <Activity size={18} />;
    return <FileText size={18} />;
  };

  const typeColor = (type) => {
    if (type === 'Lab Report') return 'var(--accent-teal)';
    if (type === 'Prescription') return 'var(--primary-soft)';
    if (type === 'Vitals Log') return 'var(--accent-amber)';
    return 'var(--accent-purple)';
  };

  const filtered = records.filter(r =>
    (selectedPatient === 'all' || r.patient === selectedPatient) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) || r.patient.toLowerCase().includes(search.toLowerCase()))
  );

  const uniquePatients = [...new Set(records.map(r => r.patient))];

  const handleDownload = (record) => {
    addToast(`📄 Downloading "${record.title}" as PDF...`, 'info');
    setTimeout(() => {
      addToast(`✅ "${record.title}" downloaded successfully`, 'success');
    }, 1500);
  };

  const handleMarkReviewed = (recordId) => {
    setRecords(prev => prev.map(r => r.id === recordId ? { ...r, status: 'reviewed' } : r));
    addToast('Record marked as reviewed ✓', 'success');
  };

  const handleUploadRecord = () => {
    if (!uploadForm.patient || !uploadForm.title) {
      addToast('Please fill in patient and title', 'warning');
      return;
    }
    const newRecord = {
      id: `r_${Date.now()}`,
      patient: uploadForm.patient,
      avatar: uploadForm.patient.split(' ').map(w => w[0]).join(''),
      type: uploadForm.type,
      title: uploadForm.title,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'pending',
      summary: uploadForm.summary || 'Pending review',
      details: uploadForm.summary || 'No details provided yet.'
    };
    setRecords(prev => [newRecord, ...prev]);
    setShowUpload(false);
    setUploadForm({ patient: '', type: 'Lab Report', title: '', summary: '' });
    addToast(`📄 Record "${newRecord.title}" added successfully`, 'success');
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 className="page-title">Health Records</h1>
            <p className="page-description">Patient reports, prescriptions, and clinical notes</p>
          </div>
          <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={() => setShowUpload(true)}>
            <Upload size={18} /> Add Record
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
          background: 'var(--bg-card)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--border-radius)', flex: '1', minWidth: '200px', maxWidth: '350px'
        }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', outline: 'none', width: '100%' }}
          />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>}
        </div>
        <div className="pill-tabs">
          <button className={`pill-tab ${selectedPatient === 'all' ? 'active' : ''}`} onClick={() => setSelectedPatient('all')}>All</button>
          {uniquePatients.map(p => (
            <button key={p} className={`pill-tab ${selectedPatient === p ? 'active' : ''}`} onClick={() => setSelectedPatient(p)}>
              {p.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map((rec, i) => (
          <motion.div
            key={rec.id}
            className="card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}
          >
            <div style={{ display: 'flex', gap: '14px', flex: 1 }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `${typeColor(rec.type)}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: typeColor(rec.type), flexShrink: 0
              }}>
                {typeIcon(rec.type)}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{rec.title}</div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{rec.patient}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>•</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={10} /> {rec.date}
                  </span>
                  <span className={`badge ${rec.type === 'Lab Report' ? 'badge-success' : rec.type === 'Prescription' ? 'badge-info' : 'badge-purple'}`} style={{ fontSize: '0.6rem' }}>
                    {rec.type}
                  </span>
                  <span className={`badge ${rec.status === 'reviewed' ? 'badge-success' : rec.status === 'active' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.6rem' }}>
                    {rec.status}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                  {rec.summary}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {rec.status === 'pending' && (
                <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleMarkReviewed(rec.id)} style={{ padding: '6px 12px', minHeight: 'unset', color: 'var(--accent-emerald)' }}>
                  <CheckCircle2 size={14} /> Review
                </motion.button>
              )}
              <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.95 }} onClick={() => setViewingRecord(rec)} style={{ padding: '6px 10px', minHeight: 'unset' }}>
                <Eye size={14} /> View
              </motion.button>
              <motion.button className="btn btn-ghost btn-sm" whileTap={{ scale: 0.95 }} onClick={() => handleDownload(rec)} style={{ padding: '6px 10px', minHeight: 'unset' }}>
                <Download size={14} /> PDF
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText size={32} /></div>
          <h3>No records found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try a different search or filter</p>
        </div>
      )}

      {/* View Record Modal */}
      <Modal isOpen={!!viewingRecord} onClose={() => setViewingRecord(null)} title={viewingRecord?.title || ''} subtitle={viewingRecord ? `${viewingRecord.patient} • ${viewingRecord.date}` : ''} maxWidth="640px">
        {viewingRecord && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span className={`badge ${viewingRecord.type === 'Lab Report' ? 'badge-success' : viewingRecord.type === 'Prescription' ? 'badge-info' : 'badge-purple'}`}>
                {viewingRecord.type}
              </span>
              <span className={`badge ${viewingRecord.status === 'reviewed' ? 'badge-success' : viewingRecord.status === 'active' ? 'badge-info' : 'badge-warning'}`}>
                {viewingRecord.status}
              </span>
            </div>

            <div style={{
              padding: '20px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)',
              fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.8,
              whiteSpace: 'pre-line', marginBottom: '20px', fontFamily: 'monospace',
              maxHeight: '400px', overflowY: 'auto'
            }}>
              {viewingRecord.details}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.button className="btn btn-primary btn-sm" style={{ flex: 1 }} whileTap={{ scale: 0.97 }} onClick={() => { handleDownload(viewingRecord); setViewingRecord(null); }}>
                <Download size={16} /> Download PDF
              </motion.button>
              {viewingRecord.status === 'pending' && (
                <motion.button className="btn btn-ghost btn-sm" style={{ flex: 1, color: 'var(--accent-emerald)' }} whileTap={{ scale: 0.97 }} onClick={() => { handleMarkReviewed(viewingRecord.id); setViewingRecord(null); }}>
                  <CheckCircle2 size={16} /> Mark Reviewed
                </motion.button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Record Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Add Health Record" subtitle="Upload a new patient record">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="input-group">
            <label className="input-label">Patient</label>
            <select className="input" value={uploadForm.patient} onChange={(e) => setUploadForm(prev => ({ ...prev, patient: e.target.value }))} style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
              <option value="">Select patient...</option>
              {uniquePatients.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Record Type</label>
            <select className="input" value={uploadForm.type} onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value }))} style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}>
              {['Lab Report', 'Prescription', 'Clinical Notes', 'Vitals Log'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Title</label>
            <input className="input" placeholder="e.g. HbA1c Test Results" value={uploadForm.title} onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))} />
          </div>
          <div className="input-group">
            <label className="input-label">Summary</label>
            <textarea className="input" rows={3} placeholder="Brief summary of findings..." value={uploadForm.summary} onChange={(e) => setUploadForm(prev => ({ ...prev, summary: e.target.value }))} style={{ resize: 'vertical', minHeight: '80px' }} />
          </div>
          <motion.button className="btn btn-primary" whileTap={{ scale: 0.97 }} onClick={handleUploadRecord} style={{ width: '100%' }}>
            <Upload size={18} /> Add Record
          </motion.button>
        </div>
      </Modal>
    </div>
  );
}
