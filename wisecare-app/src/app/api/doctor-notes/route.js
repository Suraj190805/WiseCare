import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    const { data: notes, error } = await supabase
      .from('doctor_notes')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;

    const result = notes.map(n => ({
      id: n.note_id,
      text: n.text,
      doctor: n.doctor,
      patientId: n.patient_id,
      date: n.date,
      timestamp: n.timestamp,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const noteId = body.id || `note_${Date.now()}`;

    const { data, error } = await supabase.from('doctor_notes').insert({
      note_id: noteId,
      text: body.text,
      doctor: body.doctor,
      patient_id: body.patientId || 'usr_patient_001',
      date: body.date || new Date().toLocaleDateString('en-IN'),
      timestamp: body.timestamp || Date.now(),
    }).select().single();
    if (error) throw error;

    return NextResponse.json({
      id: data.note_id,
      text: data.text,
      doctor: data.doctor,
      patientId: data.patient_id,
      date: data.date,
      timestamp: data.timestamp,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
