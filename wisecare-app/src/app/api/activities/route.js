import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    const { data: activities, error } = await supabase
      .from('activities')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(50);
    if (error) throw error;

    const result = activities.map(a => ({
      id: a.act_id,
      type: a.type,
      message: a.message,
      role: a.role,
      icon: a.icon,
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
    const actId = body.id || `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const { data, error } = await supabase.from('activities').insert({
      act_id: actId,
      type: body.type,
      message: body.message,
      role: body.role,
      icon: body.icon,
      timestamp: body.timestamp || Date.now(),
    }).select().single();
    if (error) throw error;

    return NextResponse.json({
      id: data.act_id,
      type: data.type,
      message: data.message,
      role: data.role,
      icon: data.icon,
      timestamp: data.timestamp,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
