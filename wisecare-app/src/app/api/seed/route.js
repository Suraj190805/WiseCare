import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';
import {
  MOCK_USERS, MOCK_MEDICATIONS, MOCK_MED_LOGS,
  MOCK_VITALS, MOCK_ALERTS, MOCK_APPOINTMENTS,
} from '@/lib/mockData';

export async function POST() {
  try {
    const results = {};

    // Seed Users
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (userCount === 0) {
      const users = Object.values(MOCK_USERS).map(u => ({
        user_id: u.id,
        name: u.name,
        role: u.role,
        age: u.age,
        pin: u.pin,
        avatar: u.avatar,
        email: u.email,
        phone: u.phone,
        conditions: u.conditions || [],
        emergency_contacts: u.emergencyContacts || [],
        preferred_language: u.preferredLanguage || 'English',
        location: u.location || null,
        linked_patients: u.linkedPatients || [],
        relation: u.relation || null,
        specialization: u.specialization || null,
        license_no: u.licenseNo || null,
        patients: u.patients || [],
      }));
      const { error } = await supabase.from('users').insert(users);
      if (error) throw error;
      results.users = users.length;
    } else {
      results.users = 'already seeded';
    }

    // Seed Medications
    const { count: medCount } = await supabase.from('medications').select('*', { count: 'exact', head: true });
    if (medCount === 0) {
      const meds = MOCK_MEDICATIONS.map(m => ({
        med_id: m.id,
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        times: m.times,
        color: m.color,
        instructions: m.instructions,
        remaining: m.remaining,
        total: m.total,
      }));
      const { error } = await supabase.from('medications').insert(meds);
      if (error) throw error;
      results.medications = meds.length;
    } else {
      results.medications = 'already seeded';
    }

    // Seed MedLogs
    const { count: logCount } = await supabase.from('med_logs').select('*', { count: 'exact', head: true });
    if (logCount === 0) {
      const logs = MOCK_MED_LOGS.map(l => ({
        log_id: l.id,
        med_id: l.medId,
        time: l.time,
        status: l.status,
        date: l.date,
      }));
      const { error } = await supabase.from('med_logs').insert(logs);
      if (error) throw error;
      results.medLogs = logs.length;
    } else {
      results.medLogs = 'already seeded';
    }

    // Seed Vitals
    const { count: vitalCount } = await supabase.from('vitals').select('*', { count: 'exact', head: true });
    if (vitalCount === 0) {
      const vitals = {
        patient_id: 'usr_patient_001',
        heart_rate: MOCK_VITALS.heartRate,
        blood_pressure: MOCK_VITALS.bloodPressure,
        blood_sugar: MOCK_VITALS.bloodSugar,
        spo2: MOCK_VITALS.spo2,
        temperature: MOCK_VITALS.temperature,
        weight: MOCK_VITALS.weight,
      };
      const { error } = await supabase.from('vitals').insert(vitals);
      if (error) throw error;
      results.vitals = 1;
    } else {
      results.vitals = 'already seeded';
    }

    // Seed Alerts
    const { count: alertCount } = await supabase.from('alerts').select('*', { count: 'exact', head: true });
    if (alertCount === 0) {
      const alerts = MOCK_ALERTS.map(a => ({
        alert_id: a.id,
        type: a.type,
        message: a.message,
        time: a.time,
        severity: a.severity,
        read: a.read || false,
        source: 'system',
        timestamp: Date.now() - Math.floor(Math.random() * 86400000),
      }));
      const { error } = await supabase.from('alerts').insert(alerts);
      if (error) throw error;
      results.alerts = alerts.length;
    } else {
      results.alerts = 'already seeded';
    }

    // Seed Appointments
    const { count: aptCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true });
    if (aptCount === 0) {
      const apts = MOCK_APPOINTMENTS.map(a => ({
        apt_id: a.id,
        doctor: a.doctor,
        patient: a.patient || null,
        specialty: a.specialty,
        date: a.date,
        time: a.time,
        type: a.type,
        status: a.status,
      }));
      const { error } = await supabase.from('appointments').insert(apts);
      if (error) throw error;
      results.appointments = apts.length;
    } else {
      results.appointments = 'already seeded';
    }

    // Seed Messages
    const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });
    if (msgCount === 0) {
      const msgs = [
        { msg_id: 'msg_1', from_role: 'doctor', from_name: 'Dr. Priya Sharma', to_role: 'caregiver', to_name: 'Meera Kumar', text: "Rajan's blood sugar is trending down nicely. Continue monitoring.", timestamp: Date.now() - 7200000, read: true },
        { msg_id: 'msg_2', from_role: 'caregiver', from_name: 'Meera Kumar', to_role: 'doctor', to_name: 'Dr. Priya Sharma', text: "He's been following the diet plan well this week. Will keep an eye on evening doses.", timestamp: Date.now() - 3600000, read: true },
        { msg_id: 'msg_3', from_role: 'doctor', from_name: 'Dr. Priya Sharma', to_role: 'patient', to_name: 'Rajan Kumar', text: 'Good job on your morning walks, Rajan! Keep it up 👍', timestamp: Date.now() - 1800000, read: false },
      ];
      const { error } = await supabase.from('messages').insert(msgs);
      if (error) throw error;
      results.messages = msgs.length;
    } else {
      results.messages = 'already seeded';
    }

    // Seed Activity Feed
    const { count: actCount } = await supabase.from('activities').select('*', { count: 'exact', head: true });
    if (actCount === 0) {
      const activities = [
        { act_id: 'act_1', type: 'medication', message: 'Rajan took Metformin 500mg (morning dose)', role: 'patient', icon: '💊', timestamp: Date.now() - 3600000 },
        { act_id: 'act_2', type: 'vitals', message: 'Blood sugar reading recorded: 142 mg/dL', role: 'patient', icon: '🩸', timestamp: Date.now() - 7200000 },
        { act_id: 'act_3', type: 'appointment', message: 'Dr. Priya confirmed appointment for today at 3:00 PM', role: 'doctor', icon: '📅', timestamp: Date.now() - 10800000 },
        { act_id: 'act_4', type: 'note', message: "Meera checked in on Rajan's medication status", role: 'caregiver', icon: '👁', timestamp: Date.now() - 14400000 },
      ];
      const { error } = await supabase.from('activities').insert(activities);
      if (error) throw error;
      results.activities = activities.length;
    } else {
      results.activities = 'already seeded';
    }

    return NextResponse.json({ success: true, seeded: results });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
