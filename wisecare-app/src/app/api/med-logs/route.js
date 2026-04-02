import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    const { data: logs, error } = await supabase.from('med_logs').select('*');
    if (error) throw error;

    const result = logs.map(l => ({
      id: l.log_id,
      medId: l.med_id,
      time: l.time,
      status: l.status,
      date: l.date,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const logs = Array.isArray(body) ? body : [body];
    const docs = logs.map(l => ({
      log_id: l.id || `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      med_id: l.medId,
      time: l.time,
      status: l.status || 'pending',
      date: l.date || 'today',
    }));
    const { data, error } = await supabase.from('med_logs').insert(docs).select();
    if (error) throw error;

    const result = data.map(d => ({
      id: d.log_id,
      medId: d.med_id,
      time: d.time,
      status: d.status,
      date: d.date,
    }));
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    const { error } = await supabase.from('med_logs').update({ status }).eq('log_id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const medId = searchParams.get('medId');
    if (medId) {
      const { error } = await supabase.from('med_logs').delete().eq('med_id', medId);
      if (error) throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
