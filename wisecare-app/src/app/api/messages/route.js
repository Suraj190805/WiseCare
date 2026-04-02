import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    const { data: msgs, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true });
    if (error) throw error;

    const result = msgs.map(m => ({
      id: m.msg_id,
      from: m.from_role,
      fromName: m.from_name,
      to: m.to_role,
      toName: m.to_name,
      text: m.text,
      timestamp: m.timestamp,
      read: m.read,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const msgId = body.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const { data, error } = await supabase.from('messages').insert({
      msg_id: msgId,
      from_role: body.from,
      from_name: body.fromName,
      to_role: body.to,
      to_name: body.toName,
      text: body.text,
      timestamp: body.timestamp || Date.now(),
      read: false,
    }).select().single();
    if (error) throw error;

    return NextResponse.json({
      id: data.msg_id,
      from: data.from_role,
      fromName: data.from_name,
      to: data.to_role,
      toName: data.to_name,
      text: data.text,
      timestamp: data.timestamp,
      read: data.read,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (body.markAllForRole) {
      const { error } = await supabase.from('messages').update({ read: true }).eq('to_role', body.markAllForRole);
      if (error) throw error;
    } else if (body.id) {
      const { error } = await supabase.from('messages').update({ read: true }).eq('msg_id', body.id);
      if (error) throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
