import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    let query = supabase.from('users').select('*');
    if (role) query = query.eq('role', role);

    const { data: users, error } = await query;
    if (error) throw error;

    const result = users.map(u => ({
      id: u.user_id,
      name: u.name,
      role: u.role,
      age: u.age,
      avatar: u.avatar,
      email: u.email,
      phone: u.phone,
      conditions: u.conditions,
      emergencyContacts: u.emergency_contacts,
      preferredLanguage: u.preferred_language,
      location: u.location,
      linkedPatients: u.linked_patients,
      relation: u.relation,
      specialization: u.specialization,
      licenseNo: u.license_no,
      patients: u.patients,
    }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Demo login validation
    if (body.action === 'login') {
      if (body.role === 'patient') {
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'patient')
          .limit(1);
        if (error) throw error;
        const user = users?.[0];
        if (user && user.pin === body.pin) {
          return NextResponse.json({ success: true, user: { id: user.user_id, role: user.role, name: user.name } });
        }
        return NextResponse.json({ success: false, error: 'Invalid PIN' }, { status: 401 });
      }
      // Doctor/Caregiver — demo, always succeed
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', body.role)
        .limit(1);
      if (error) throw error;
      const user = users?.[0];
      if (user) {
        return NextResponse.json({ success: true, user: { id: user.user_id, role: user.role, name: user.name } });
      }
    }
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
