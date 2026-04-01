// Mock data store for the CareCompanion AI hackathon demo
// In production, this would connect to Supabase/PostgreSQL

export const MOCK_USERS = {
  patient: {
    id: 'usr_patient_001',
    name: 'Rajan Kumar',
    role: 'patient',
    age: 73,
    pin: '1234',
    avatar: 'RK',
    phone: '+91 98765 43210',
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    emergencyContacts: [
      { id: 'ec_1', name: 'Meera Kumar', relation: 'Daughter', phone: '+91 98765 11111', priority: 1 },
      { id: 'ec_2', name: 'Arun Kumar', relation: 'Son', phone: '+91 98765 22222', priority: 2 },
      { id: 'ec_3', name: 'Dr. Priya Sharma', relation: 'Doctor', phone: '+91 98765 33333', priority: 3 },
    ],
    preferredLanguage: 'English',
    location: { lat: 12.9716, lng: 77.5946, address: 'Jayanagar, Bangalore' },
  },
  caregiver: {
    id: 'usr_caregiver_001',
    name: 'Meera Kumar',
    role: 'caregiver',
    avatar: 'MK',
    email: 'meera@example.com',
    linkedPatients: ['usr_patient_001'],
    relation: 'Daughter',
  },
  doctor: {
    id: 'usr_doctor_001',
    name: 'Dr. Priya Sharma',
    role: 'doctor',
    avatar: 'PS',
    email: 'dr.priya@hospital.com',
    specialization: 'Cardiologist',
    licenseNo: 'KMC-2015-4521',
    patients: ['usr_patient_001'],
  },
};

export const MOCK_MEDICATIONS = [
  {
    id: 'med_001',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    times: ['08:00', '20:00'],
    color: 'teal',
    instructions: 'Take with food',
    remaining: 24,
    total: 30,
  },
  {
    id: 'med_002',
    name: 'Amlodipine',
    dosage: '5mg',
    frequency: 'Once daily',
    times: ['09:00'],
    color: 'primary',
    instructions: 'Take in the morning',
    remaining: 18,
    total: 30,
  },
  {
    id: 'med_003',
    name: 'Atorvastatin',
    dosage: '10mg',
    frequency: 'Once daily (night)',
    times: ['21:00'],
    color: 'purple',
    instructions: 'Take before bed',
    remaining: 28,
    total: 30,
  },
  {
    id: 'med_004',
    name: 'Aspirin',
    dosage: '75mg',
    frequency: 'Once daily',
    times: ['08:00'],
    color: 'amber',
    instructions: 'Take after breakfast',
    remaining: 15,
    total: 30,
  },
];

export const MOCK_MED_LOGS = [
  { id: 'log_1', medId: 'med_001', time: '08:00', status: 'taken', date: 'today' },
  { id: 'log_2', medId: 'med_002', time: '09:00', status: 'taken', date: 'today' },
  { id: 'log_3', medId: 'med_004', time: '08:00', status: 'taken', date: 'today' },
  { id: 'log_4', medId: 'med_001', time: '20:00', status: 'pending', date: 'today' },
  { id: 'log_5', medId: 'med_003', time: '21:00', status: 'pending', date: 'today' },
];

export const MOCK_VITALS = {
  heartRate: { current: 72, unit: 'bpm', trend: 'stable', history: [74, 71, 73, 72, 75, 71, 72] },
  bloodPressure: { current: '128/82', unit: 'mmHg', trend: 'stable', history: ['130/85', '128/83', '126/80', '129/84', '127/81', '128/82', '128/82'] },
  bloodSugar: { current: 142, unit: 'mg/dL', trend: 'improving', history: [165, 158, 150, 148, 145, 143, 142] },
  spo2: { current: 97, unit: '%', trend: 'stable', history: [96, 97, 97, 98, 97, 96, 97] },
  temperature: { current: 98.2, unit: '°F', trend: 'stable', history: [98.4, 98.1, 98.3, 98.2, 98.5, 98.1, 98.2] },
  weight: { current: 72, unit: 'kg', trend: 'stable', history: [72.5, 72.3, 72.1, 72.0, 72.2, 72.1, 72.0] },
};

export const MOCK_ADHERENCE_WEEKLY = [
  { day: 'Mon', adherence: 100 },
  { day: 'Tue', adherence: 75 },
  { day: 'Wed', adherence: 100 },
  { day: 'Thu', adherence: 50 },
  { day: 'Fri', adherence: 100 },
  { day: 'Sat', adherence: 100 },
  { day: 'Sun', adherence: 88 },
];

export const MOCK_ACTIVITY_DATA = [
  { day: 'Mon', steps: 3200, active: 45 },
  { day: 'Tue', steps: 4100, active: 52 },
  { day: 'Wed', steps: 2800, active: 38 },
  { day: 'Thu', steps: 3600, active: 48 },
  { day: 'Fri', steps: 4500, active: 55 },
  { day: 'Sat', steps: 2100, active: 30 },
  { day: 'Sun', steps: 3900, active: 50 },
];

export const MOCK_ALERTS = [
  { id: 'alert_1', type: 'medication', message: 'Metformin dose missed at 8:00 PM', time: '2 min ago', severity: 'warning', read: false },
  { id: 'alert_2', type: 'activity', message: 'No activity detected for 3 hours', time: '45 min ago', severity: 'info', read: false },
  { id: 'alert_3', type: 'vitals', message: 'Blood sugar reading above target (165 mg/dL)', time: '2 hours ago', severity: 'warning', read: true },
  { id: 'alert_4', type: 'location', message: 'Rajan left safe zone (Home)', time: '3 hours ago', severity: 'info', read: true },
  { id: 'alert_5', type: 'sos', message: 'SOS alert triggered and resolved', time: 'Yesterday', severity: 'danger', read: true },
];

export const MOCK_APPOINTMENTS = [
  { id: 'apt_1', doctor: 'Dr. Priya Sharma', specialty: 'Cardiologist', date: 'Today', time: '3:00 PM', type: 'video', status: 'upcoming' },
  { id: 'apt_2', doctor: 'Dr. Rajesh Iyer', specialty: 'Endocrinologist', date: 'Apr 5', time: '11:00 AM', type: 'in-person', status: 'scheduled' },
  { id: 'apt_3', doctor: 'Dr. Priya Sharma', specialty: 'Cardiologist', date: 'Apr 12', time: '2:30 PM', type: 'video', status: 'scheduled' },
];

export const MOCK_MEALS = {
  breakfast: {
    name: 'Oats Upma with Vegetables',
    time: '8:30 AM',
    calories: 320,
    items: ['Oats upma', 'Mixed vegetables', 'Green chutney', 'Buttermilk'],
    nutrition: { protein: 12, carbs: 45, fat: 8, fiber: 6 },
    status: 'completed',
  },
  lunch: {
    name: 'Brown Rice with Dal & Sabzi',
    time: '1:00 PM',
    calories: 480,
    items: ['Brown rice', 'Moong dal', 'Palak sabzi', 'Curd', 'Salad'],
    nutrition: { protein: 18, carbs: 60, fat: 12, fiber: 8 },
    status: 'upcoming',
  },
  snack: {
    name: 'Mixed Fruits & Nuts',
    time: '4:30 PM',
    calories: 180,
    items: ['Apple slices', 'Almonds (5)', 'Walnuts (3)', 'Green tea'],
    nutrition: { protein: 5, carbs: 22, fat: 9, fiber: 4 },
    status: 'upcoming',
  },
  dinner: {
    name: 'Roti with Lauki Sabzi',
    time: '7:30 PM',
    calories: 380,
    items: ['Wheat roti (2)', 'Lauki sabzi', 'Raita', 'Mixed salad'],
    nutrition: { protein: 14, carbs: 48, fat: 10, fiber: 7 },
    status: 'upcoming',
  },
};

export const MOCK_HYDRATION = {
  current: 5,
  target: 8,
  unit: 'glasses',
  logs: ['7:00 AM', '9:30 AM', '11:00 AM', '1:00 PM', '3:30 PM'],
};

export const MOCK_WELLNESS_CHECKIN = {
  sleep: { score: 7, label: 'Good', hours: 7.5 },
  pain: { score: 2, label: 'Mild', location: 'Knee' },
  mood: { score: 8, label: 'Happy', note: 'Enjoyed morning walk' },
};

export const MOCK_LOCATION_HISTORY = [
  { time: '8:00 AM', lat: 12.9716, lng: 77.5946, place: 'Home', zone: 'safe' },
  { time: '9:30 AM', lat: 12.9720, lng: 77.5960, place: 'Morning Walk - Park', zone: 'safe' },
  { time: '10:15 AM', lat: 12.9716, lng: 77.5946, place: 'Home', zone: 'safe' },
  { time: '12:00 PM', lat: 12.9730, lng: 77.5980, place: 'Temple', zone: 'safe' },
  { time: '1:00 PM', lat: 12.9716, lng: 77.5946, place: 'Home (Current)', zone: 'safe' },
];

export const MOCK_SAFE_ZONES = [
  { id: 'zone_1', name: 'Home', lat: 12.9716, lng: 77.5946, radius: 200, active: true },
  { id: 'zone_2', name: 'Park', lat: 12.9720, lng: 77.5960, radius: 300, active: true },
  { id: 'zone_3', name: 'Temple', lat: 12.9730, lng: 77.5980, radius: 150, active: true },
];

export const MOCK_CHAT_HISTORY = [
  { id: 'msg_1', role: 'ai', content: 'Good morning, Rajan! 🌅 I hope you slept well. You have 3 medications scheduled for today. Would you like me to remind you about them?', timestamp: '8:00 AM' },
  { id: 'msg_2', role: 'user', content: 'Good morning! Yes, please tell me about my medicines today.', timestamp: '8:01 AM' },
  { id: 'msg_3', role: 'ai', content: 'Of course! Here\'s your schedule for today:\n\n💊 **8:00 AM** — Metformin 500mg & Aspirin 75mg (take with breakfast)\n💊 **9:00 AM** — Amlodipine 5mg\n💊 **8:00 PM** — Metformin 500mg (with dinner)\n💊 **9:00 PM** — Atorvastatin 10mg (before bed)\n\nYou\'ve already taken your morning doses. Well done! 👏', timestamp: '8:01 AM' },
  { id: 'msg_4', role: 'user', content: 'What should I eat for breakfast?', timestamp: '8:05 AM' },
  { id: 'msg_5', role: 'ai', content: 'Based on your diabetes management plan, I recommend **Oats Upma with Vegetables** this morning. It\'s:\n\n🥣 Low glycemic index — gentle on blood sugar\n🥦 Rich in fiber — keeps you full longer\n💪 12g protein — good for energy\n\nAvoid adding sugar. You can have buttermilk on the side — it\'s cooling and good for digestion.\n\nWould you like the full recipe, or shall I suggest something else?', timestamp: '8:05 AM' },
];

// AI System Prompt for the chatbot
export const AI_SYSTEM_PROMPT = `You are CareCompanion AI, a warm, compassionate, and knowledgeable healthcare companion for elderly individuals. You are speaking with Rajan, a 73-year-old retired teacher who manages Type 2 Diabetes and Hypertension.

Key guidelines:
- Be warm, patient, and respectful. Use simple, clear language.
- Address health queries with evidence-based information but always recommend consulting a doctor for medical decisions.
- You know Rajan's medication schedule: Metformin 500mg (twice daily), Amlodipine 5mg (morning), Atorvastatin 10mg (night), Aspirin 75mg (morning).
- You know his dietary requirements: diabetic-friendly, low sodium, high fiber, culturally Indian meals.
- Be proactive about reminders and wellness check-ins.
- If Rajan mentions pain, discomfort, or emergency symptoms, immediately suggest contacting emergency services or his doctor.
- Keep responses concise but informative. Use emojis sparingly for warmth.
- You can discuss: medications, diet, exercise, appointments, general wellness, emotional support.
- Never provide specific medical diagnoses. Always defer to Dr. Priya Sharma for clinical decisions.`;

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getCurrentTime() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function getCurrentDate() {
  return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
