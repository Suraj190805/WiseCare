import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;

    const result = alerts.map(a => ({
      id: a.alert_id,
      type: a.type,
      message: a.message,
      time: a.time,
      severity: a.severity,
      read: a.read,
      source: a.source,
      timestamp: a.timestamp,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const alertId = body.id || `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const time = body.time || new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const { data, error } = await supabase.from('alerts').insert({
      alert_id: alertId,
      type: body.type,
      message: body.message,
      time,
      severity: body.severity || 'info',
      read: false,
      source: body.source || 'system',
      timestamp: body.timestamp || Date.now(),
    }).select().single();
    if (error) throw error;

    return NextResponse.json({
      id: data.alert_id,
      type: data.type,
      message: data.message,
      time: data.time,
      severity: data.severity,
      read: data.read,
      source: data.source,
      timestamp: data.timestamp,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (body.markAll) {
      const { error } = await supabase.from('alerts').update({ read: true }).neq('read', true);
      if (error) throw error;
    } else if (body.id) {
      const { error } = await supabase.from('alerts').update({ read: true }).eq('alert_id', body.id);
      if (error) throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id === 'all') {
      const { error } = await supabase.from('alerts').delete().neq('alert_id', '');
      if (error) throw error;
    } else if (id) {
      const { error } = await supabase.from('alerts').delete().eq('alert_id', id);
      if (error) throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
