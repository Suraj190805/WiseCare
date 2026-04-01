'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, CheckCircle2, Info, Pill, ArrowRight, Eye, Bell, BellOff } from 'lucide-react';
import { useToast } from '@/lib/Toast';
import Modal from '@/lib/Modal';

export default function DoctorInteractionsPage() {
  const { addToast } = useToast();
  const [selectedInteraction, setSelectedInteraction] = useState(null);

  const [interactions, setInteractions] = useState([
    {
      id: 'i1', patient: 'Rajan Kumar', avatar: 'RK',
      drug1: 'Metformin 500mg', drug2: 'Atorvastatin 10mg',
      severity: 'low', risk: 'Low',
      mechanism: 'Statins may slightly increase blood glucose levels, potentially reducing Metformin effectiveness.',
      recommendation: 'Monitor fasting blood glucose more frequently. No dosage adjustment typically needed.',
      evidence: 'Based on FDA drug interaction database and clinical studies (Ridker et al., 2008).',
      status: 'monitored',
      actions: ['Monitor glucose weekly', 'Check liver function quarterly']
    },
    {
      id: 'i2', patient: 'Rajan Kumar', avatar: 'RK',
      drug1: 'Aspirin 75mg', drug2: 'Amlodipine 5mg',
      severity: 'moderate', risk: 'Moderate',
      mechanism: 'NSAIDs including Aspirin may antagonize the antihypertensive effect of calcium channel blockers.',
      recommendation: 'Monitor blood pressure closely. Consider alternative antiplatelet if BP remains elevated. Check readings weekly.',
      evidence: 'FDA label warning. Supported by meta-analysis (Sowers et al., 2005).',
      status: 'action_needed',
      actions: ['Weekly BP monitoring', 'Consider Clopidogrel as alternative', 'Review in 2 weeks']
    },
    {
      id: 'i3', patient: 'Mohan Lal', avatar: 'ML',
      drug1: 'Salbutamol Inhaler', drug2: 'Metformin 1000mg',
      severity: 'low', risk: 'Low',
      mechanism: 'Beta-2 agonists may transiently increase blood glucose. Usually not clinically significant at inhaled doses.',
      recommendation: 'Inform patient to monitor glucose after using inhaler. Usually no dose adjustment needed.',
      evidence: 'Pharmacological interaction. Reference: BNF Drug Interactions.',
      status: 'monitored',
      actions: ['Patient education on glucose monitoring', 'Track post-inhaler glucose readings']
    },
    {
      id: 'i4', patient: 'Kamala Rao', avatar: 'KR',
      drug1: 'Digoxin 0.25mg', drug2: 'Amiodarone 200mg',
      severity: 'high', risk: 'High',
      mechanism: 'Amiodarone significantly increases Digoxin serum levels, increasing risk of Digoxin toxicity (arrhythmias, nausea).',
      recommendation: 'Reduce Digoxin dose by 50% when initiating Amiodarone. Monitor serum Digoxin levels weekly for first month.',
      evidence: 'Well-documented. FDA Black Box consideration. (Leahey et al., NEJM 1978).',
      status: 'action_needed',
      actions: ['Reduce Digoxin to 0.125mg ASAP', 'Order serum Digoxin level', 'Weekly monitoring for 4 weeks', 'Watch for toxicity signs']
    },
  ]);

  const severityColor = (s) => s === 'high' ? 'var(--accent-rose)' : s === 'moderate' ? 'var(--accent-amber)' : 'var(--accent-teal)';
  const severityBg = (s) => s === 'high' ? 'var(--accent-rose-soft)' : s === 'moderate' ? 'var(--accent-amber-soft)' : 'var(--accent-teal-soft)';

  const handleAcknowledge = (id) => {
    setInteractions(prev => prev.map(i => i.id === id ? { ...i, status: 'monitored' } : i));
    addToast('✅ Interaction acknowledged and set to monitored', 'success');
  };

  const handleDismiss = (id) => {
    const inter = interactions.find(i => i.id === id);
    setInteractions(prev => prev.filter(i => i.id !== id));
    addToast(`Dismissed interaction: ${inter?.drug1} + ${inter?.drug2}`, 'info');
  };

  const handleEscalate = (id) => {
    const inter = interactions.find(i => i.id === id);
    addToast(`🚨 Escalated ${inter?.drug1} + ${inter?.drug2} — Alert sent to pharmacy team`, 'warning');
    setInteractions(prev => prev.map(i => i.id === id ? { ...i, status: 'escalated' } : i));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Drug Interactions</h1>
        <p className="page-description">Automated drug-drug interaction monitoring for all patients</p>
      </div>

      {/* Summary */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card rose">
          <div className="stat-icon rose"><AlertTriangle size={22} /></div>
          <div className="stat-value">{interactions.filter(i => i.severity === 'high').length}</div>
          <div className="stat-label">High Risk</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><AlertTriangle size={22} /></div>
          <div className="stat-value">{interactions.filter(i => i.severity === 'moderate').length}</div>
          <div className="stat-label">Moderate Risk</div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon teal"><Shield size={22} /></div>
          <div className="stat-value">{interactions.filter(i => i.severity === 'low').length}</div>
          <div className="stat-label">Low Risk</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><CheckCircle2 size={22} /></div>
          <div className="stat-value">{interactions.filter(i => i.status === 'monitored').length}</div>
          <div className="stat-label">Monitored</div>
        </div>
      </div>

      {/* Interactions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {interactions.map((inter, i) => (
          <motion.div
            key={inter.id}
            className="card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ borderLeft: `4px solid ${severityColor(inter.severity)}` }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--accent-teal))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700
                }}>
                  {inter.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)' }}>{inter.patient}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--primary-soft)', fontWeight: 600 }}>{inter.drug1}</span>
                    <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent-amber)', fontWeight: 600 }}>{inter.drug2}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: severityBg(inter.severity), color: severityColor(inter.severity) }}>
                  {inter.risk} Risk
                </span>
                <span className={`badge ${inter.status === 'action_needed' ? 'badge-danger' : inter.status === 'escalated' ? 'badge-warning' : 'badge-success'}`}>
                  {inter.status === 'action_needed' ? '⚠ Action Needed' : inter.status === 'escalated' ? '🚨 Escalated' : '✓ Monitored'}
                </span>
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mechanism</div>
                <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>{inter.mechanism}</div>
              </div>

              <div style={{ padding: '12px 16px', background: severityBg(inter.severity), borderRadius: 'var(--border-radius-sm)' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: severityColor(inter.severity), marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendation</div>
                <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>{inter.recommendation}</div>
              </div>

              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={12} /> {inter.evidence}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              <motion.button
                className="btn btn-ghost btn-sm"
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedInteraction(inter)}
              >
                <Eye size={14} /> View Actions
              </motion.button>
              {inter.status === 'action_needed' && (
                <>
                  <motion.button
                    className="btn btn-primary btn-sm"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAcknowledge(inter.id)}
                  >
                    <CheckCircle2 size={14} /> Acknowledge
                  </motion.button>
                  <motion.button
                    className="btn btn-ghost btn-sm"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEscalate(inter.id)}
                    style={{ color: 'var(--accent-amber)' }}
                  >
                    <Bell size={14} /> Escalate
                  </motion.button>
                </>
              )}
              {inter.status === 'monitored' && (
                <motion.button
                  className="btn btn-ghost btn-sm"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDismiss(inter.id)}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <BellOff size={14} /> Dismiss
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {interactions.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Shield size={32} /></div>
          <h3>No active interactions</h3>
          <p style={{ color: 'var(--text-secondary)' }}>All drug interactions have been resolved</p>
        </div>
      )}

      {/* Action Plan Modal */}
      <Modal
        isOpen={!!selectedInteraction}
        onClose={() => setSelectedInteraction(null)}
        title="Action Plan"
        subtitle={selectedInteraction ? `${selectedInteraction.drug1} + ${selectedInteraction.drug2}` : ''}
      >
        {selectedInteraction && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <span className="badge" style={{ background: severityBg(selectedInteraction.severity), color: severityColor(selectedInteraction.severity) }}>
                {selectedInteraction.risk} Risk
              </span>
              <span className="badge badge-info">{selectedInteraction.patient}</span>
            </div>

            <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: '12px' }}>Required Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {selectedInteraction.actions.map((action, i) => (
                <ActionCheckItem key={i} action={action} index={i} addToast={addToast} />
              ))}
            </div>

            <div style={{ padding: '14px', background: severityBg(selectedInteraction.severity), borderRadius: 'var(--border-radius-sm)', marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: severityColor(selectedInteraction.severity), marginBottom: '4px' }}>CLINICAL RECOMMENDATION</div>
              <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>{selectedInteraction.recommendation}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {selectedInteraction.status === 'action_needed' && (
                <motion.button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { handleAcknowledge(selectedInteraction.id); setSelectedInteraction(null); }}
                >
                  <CheckCircle2 size={16} /> Acknowledge & Monitor
                </motion.button>
              )}
              <motion.button
                className="btn btn-ghost btn-sm"
                style={{ flex: 1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedInteraction(null)}
              >
                Close
              </motion.button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ActionCheckItem({ action, index, addToast }) {
  const [checked, setChecked] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => {
        setChecked(!checked);
        if (!checked) addToast(`✓ Action completed: ${action}`, 'success');
      }}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 16px', background: 'var(--bg-elevated)',
        borderRadius: 'var(--border-radius-sm)', cursor: 'pointer',
        border: checked ? '1px solid var(--accent-emerald)' : '1px solid transparent',
        opacity: checked ? 0.7 : 1,
        transition: 'all 200ms ease'
      }}
    >
      <div style={{
        width: '24px', height: '24px', borderRadius: '6px',
        border: `2px solid ${checked ? 'var(--accent-emerald)' : 'var(--border-default)'}`,
        background: checked ? 'var(--accent-emerald-soft)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all 200ms ease'
      }}>
        {checked && <CheckCircle2 size={14} style={{ color: 'var(--accent-emerald)' }} />}
      </div>
      <span style={{ fontSize: 'var(--font-size-sm)', textDecoration: checked ? 'line-through' : 'none' }}>{action}</span>
    </motion.div>
  );
}
