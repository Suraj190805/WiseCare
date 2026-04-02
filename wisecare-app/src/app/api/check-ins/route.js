import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    const { data: checkins, error } = await supabase
      .from('check_ins')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;

    const result = checkins.map(c => ({
      id: c.checkin_id,
      date: c.date,
      slotId: c.slot_id,
      slotLabel: c.slot_label,
      timestamp: c.timestamp,
      time: c.time,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const checkinId = body.id || `checkin_${Date.now()}`;

    const { data, error } = await supabase.from('check_ins').insert({
      checkin_id: checkinId,
      patient_id: body.patientId || 'usr_patient_001',
      date: body.date,
      slot_id: body.slotId,
      slot_label: body.slotLabel,
      timestamp: body.timestamp || Date.now(),
      time: body.time,
    }).select().single();
    if (error) throw error;

    return NextResponse.json({
      id: data.checkin_id,
      date: data.date,
      slotId: data.slot_id,
      slotLabel: data.slot_label,
      timestamp: data.timestamp,
      time: data.time,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
