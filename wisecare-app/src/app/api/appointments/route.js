import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    const { data: apts, error } = await supabase.from('appointments').select('*');
    if (error) throw error;

    const result = apts.map(a => ({
      id: a.apt_id,
      doctor: a.doctor,
      patient: a.patient,
      specialty: a.specialty,
      date: a.date,
      time: a.time,
      type: a.type,
      status: a.status,
      outcome: a.outcome,
      source: a.source,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const aptId = body.id || `apt_${Date.now()}`;

    const { data, error } = await supabase.from('appointments').insert({
      apt_id: aptId,
      doctor: body.doctor,
      patient: body.patient || null,
      specialty: body.specialty,
      date: body.date,
      time: body.time,
      type: body.type || 'video',
      status: body.status || 'scheduled',
      source: body.source || 'system',
    }).select().single();
    if (error) throw error;

    return NextResponse.json({
      id: data.apt_id,
      doctor: data.doctor,
      patient: data.patient,
      specialty: data.specialty,
      date: data.date,
      time: data.time,
      type: data.type,
      status: data.status,
      source: data.source,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const { error } = await supabase.from('appointments').update(updates).eq('apt_id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
