import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    const { data: meds, error } = await supabase.from('medications').select('*');
    if (error) throw error;

    const result = meds.map(m => ({
      id: m.med_id,
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      times: m.times,
      color: m.color,
      instructions: m.instructions,
      remaining: m.remaining,
      total: m.total,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const medId = body.id || `med_${Date.now()}`;
    const { data, error } = await supabase.from('medications').insert({
      med_id: medId,
      name: body.name,
      dosage: body.dosage,
      frequency: body.frequency,
      times: body.times || [],
      color: body.color,
      instructions: body.instructions,
      remaining: body.remaining,
      total: body.total,
    }).select().single();
    if (error) throw error;

    return NextResponse.json({
      id: data.med_id,
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      times: data.times,
      color: data.color,
      instructions: data.instructions,
      remaining: data.remaining,
      total: data.total,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { error } = await supabase.from('medications').delete().eq('med_id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
