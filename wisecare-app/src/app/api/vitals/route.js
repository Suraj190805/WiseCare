import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('vitals')
      .select('*')
      .eq('patient_id', 'usr_patient_001')
      .limit(1)
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows found
      return NextResponse.json({});
    }
    if (error) throw error;

    return NextResponse.json({
      heartRate: data.heart_rate,
      bloodPressure: data.blood_pressure,
      bloodSugar: data.blood_sugar,
      spo2: data.spo2,
      temperature: data.temperature,
      weight: data.weight,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();

    // Map camelCase from frontend to snake_case for DB
    const updates = {};
    if (body.heartRate !== undefined) updates.heart_rate = body.heartRate;
    if (body.bloodPressure !== undefined) updates.blood_pressure = body.bloodPressure;
    if (body.bloodSugar !== undefined) updates.blood_sugar = body.bloodSugar;
    if (body.spo2 !== undefined) updates.spo2 = body.spo2;
    if (body.temperature !== undefined) updates.temperature = body.temperature;
    if (body.weight !== undefined) updates.weight = body.weight;

    // Try to update first
    const { data: existing } = await supabase
      .from('vitals')
      .select('id')
      .eq('patient_id', 'usr_patient_001')
      .limit(1)
      .single();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('vitals')
        .update(updates)
        .eq('patient_id', 'usr_patient_001')
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('vitals')
        .insert({ patient_id: 'usr_patient_001', ...updates })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      heartRate: result.heart_rate,
      bloodPressure: result.blood_pressure,
      bloodSugar: result.blood_sugar,
      spo2: result.spo2,
      temperature: result.temperature,
      weight: result.weight,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
