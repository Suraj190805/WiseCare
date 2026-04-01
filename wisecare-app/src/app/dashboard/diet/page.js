'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed, Droplets, Apple, Coffee, Sun, Moon,
  Plus, ChevronRight, Flame, Beef, Wheat, Leaf, AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { MOCK_MEALS, MOCK_HYDRATION } from '@/lib/mockData';

export default function DietPage() {
  const [activeTab, setActiveTab] = useState('today');
  const [hydration, setHydration] = useState(MOCK_HYDRATION.current);

  const totalCalories = Object.values(MOCK_MEALS).reduce((sum, m) => sum + m.calories, 0);
  const totalNutrition = Object.values(MOCK_MEALS).reduce(
    (acc, m) => ({
      protein: acc.protein + m.nutrition.protein,
      carbs: acc.carbs + m.nutrition.carbs,
      fat: acc.fat + m.nutrition.fat,
      fiber: acc.fiber + m.nutrition.fiber,
    }), { protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const pieData = [
    { name: 'Protein', value: totalNutrition.protein, color: '#4F6BFF' },
    { name: 'Carbs', value: totalNutrition.carbs, color: '#F59E0B' },
    { name: 'Fat', value: totalNutrition.fat, color: '#F43F5E' },
    { name: 'Fiber', value: totalNutrition.fiber, color: '#10B981' },
  ];

  const weeklyCalories = [
    { day: 'Mon', cal: 1320 }, { day: 'Tue', cal: 1400 },
    { day: 'Wed', cal: 1280 }, { day: 'Thu', cal: 1350 },
    { day: 'Fri', cal: 1380 }, { day: 'Sat', cal: 1450 },
    { day: 'Sun', cal: 1360 },
  ];

  const mealIcons = { breakfast: '🌅', lunch: '☀️', snack: '🍎', dinner: '🌙' };
  const mealLabels = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Evening Snack', dinner: 'Dinner' };

  const foodInteractions = [
    { food: 'Grapefruit', med: 'Atorvastatin', risk: 'high', note: 'Can increase statin side effects' },
    { food: 'High-sodium foods', med: 'Amlodipine', risk: 'medium', note: 'May reduce BP medication effectiveness' },
    { food: 'Alcohol', med: 'Metformin', risk: 'high', note: 'Risk of lactic acidosis' },
  ];

  const addWater = () => {
    if (hydration < MOCK_HYDRATION.target) {
      setHydration(h => h + 1);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Diet & Nutrition</h1>
        <p className="page-description">Personalized meal plans tailored to your health conditions</p>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Flame size={22} /></div>
          <div className="stat-value">{totalCalories}</div>
          <div className="stat-label">Total Calories Today</div>
        </div>
        <div className="stat-card primary">
          <div className="stat-icon primary"><Beef size={22} /></div>
          <div className="stat-value">{totalNutrition.protein}g</div>
          <div className="stat-label">Protein</div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon teal"><Droplets size={22} /></div>
          <div className="stat-value">{hydration}/{MOCK_HYDRATION.target}</div>
          <div className="stat-label">Glasses of Water</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><Leaf size={22} /></div>
          <div className="stat-value">{totalNutrition.fiber}g</div>
          <div className="stat-label">Fiber Intake</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="pill-tabs" style={{ marginBottom: '24px' }}>
        {['today', 'nutrition', 'interactions'].map(tab => (
          <button
            key={tab}
            className={`pill-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'today' ? "Today's Meals" : tab === 'nutrition' ? 'Nutrition Analysis' : 'Food Interactions'}
          </button>
        ))}
      </div>

      {activeTab === 'today' && (
        <div className="grid-2">
          {/* Meals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(MOCK_MEALS).map(([key, meal], i) => (
              <motion.div
                key={key}
                className="card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '14px',
                      background: meal.status === 'completed' ? 'var(--accent-emerald-soft)' : 'var(--accent-amber-soft)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem'
                    }}>
                      {mealIcons[key]}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 600 }}>{mealLabels[key]}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        {meal.time} • {meal.calories} kcal
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${meal.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {meal.status === 'completed' ? '✓ Done' : '⏰ Upcoming'}
                  </span>
                </div>

                <h4 style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: '10px', color: 'var(--accent-teal)' }}>
                  {meal.name}
                </h4>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {meal.items.map((item, j) => (
                    <span key={j} style={{
                      padding: '4px 12px', background: 'var(--bg-elevated)',
                      borderRadius: 'var(--border-radius-full)', fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-secondary)'
                    }}>
                      {item}
                    </span>
                  ))}
                </div>

                {/* Micro nutrition bars */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { label: 'Protein', val: meal.nutrition.protein, max: 25, color: 'primary' },
                    { label: 'Carbs', val: meal.nutrition.carbs, max: 70, color: 'amber' },
                    { label: 'Fat', val: meal.nutrition.fat, max: 20, color: 'rose' },
                    { label: 'Fiber', val: meal.nutrition.fiber, max: 10, color: 'emerald' },
                  ].map((n, k) => (
                    <div key={k}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{n.label}</div>
                      <div className="progress-bar" style={{ height: '5px', marginBottom: '2px' }}>
                        <div className={`progress-fill ${n.color}`} style={{ width: `${Math.min((n.val / n.max) * 100, 100)}%` }} />
                      </div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>{n.val}g</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Hydration Tracker */}
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '16px' }}>💧 Hydration Tracker</h2>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>
                  {hydration}
                  <span style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-muted)' }}>/{MOCK_HYDRATION.target}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>glasses today</div>
              </div>

              <div className="progress-bar" style={{ marginBottom: '16px', height: '10px' }}>
                <div className="progress-fill teal" style={{ width: `${(hydration / MOCK_HYDRATION.target) * 100}%` }} />
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
                {Array.from({ length: MOCK_HYDRATION.target }).map((_, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.2 }}
                    style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: i < hydration ? 'var(--accent-teal-soft)' : 'var(--bg-elevated)',
                      border: i < hydration ? '1px solid rgba(45,212,191,0.3)' : '1px solid var(--border-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                    }}
                  >
                    {i < hydration ? '💧' : '○'}
                  </motion.div>
                ))}
              </div>

              <motion.button
                className="btn btn-teal w-full"
                onClick={addWater}
                whileTap={{ scale: 0.97 }}
                style={{ width: '100%' }}
                disabled={hydration >= MOCK_HYDRATION.target}
              >
                <Plus size={18} /> Log Water
              </motion.button>
            </div>

            {/* Nutrition Pie */}
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '8px' }}>Macro Breakdown</h2>
              <div style={{ height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                {pieData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }} />
                    {d.name}: {d.value}g
                  </div>
                ))}
              </div>
            </div>

            {/* Diabetic-friendly tip */}
            <div className="card" style={{ background: 'rgba(45, 212, 191, 0.05)', borderColor: 'rgba(45, 212, 191, 0.2)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>💡</div>
                <div>
                  <h3 style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--accent-teal)', marginBottom: '4px' }}>
                    Diabetes Tip
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Eating meals at consistent times helps maintain stable blood sugar. Try to eat dinner before 8 PM for better glucose control overnight.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nutrition' && (
        <div className="grid-2">
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '16px' }}>Weekly Calorie Intake</h2>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyCalories}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ background: '#1F2937', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#F3F4F6' }}
                    formatter={(v) => [`${v} kcal`, 'Calories']}
                  />
                  <Bar dataKey="cal" radius={[6, 6, 0, 0]} fill="url(#calGradient)" />
                  <defs>
                    <linearGradient id="calGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Target: 1,300-1,500 kcal/day for your profile
              </span>
            </div>
          </div>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '16px' }}>Daily Targets vs Actual</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '12px 0' }}>
              {[
                { label: 'Calories', actual: totalCalories, target: 1400, unit: 'kcal', color: 'amber' },
                { label: 'Protein', actual: totalNutrition.protein, target: 55, unit: 'g', color: 'primary' },
                { label: 'Carbs', actual: totalNutrition.carbs, target: 180, unit: 'g', color: 'amber' },
                { label: 'Fat', actual: totalNutrition.fat, target: 45, unit: 'g', color: 'rose' },
                { label: 'Fiber', actual: totalNutrition.fiber, target: 30, unit: 'g', color: 'emerald' },
                { label: 'Water', actual: hydration, target: MOCK_HYDRATION.target, unit: 'glasses', color: 'teal' },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                      {item.actual} / {item.target} {item.unit}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-fill ${item.color}`} style={{ width: `${Math.min((item.actual / item.target) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'interactions' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <AlertCircle size={22} style={{ color: 'var(--accent-amber)' }} />
            <div>
              <h2 className="card-title">Food-Drug Interactions</h2>
              <p className="card-subtitle">Foods that may interact with your current medications</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {foodInteractions.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  padding: '20px', background: 'var(--bg-elevated)',
                  borderRadius: 'var(--border-radius-sm)',
                  borderLeft: `4px solid ${item.risk === 'high' ? 'var(--accent-rose)' : 'var(--accent-amber)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
                }}
              >
                <div>
                  <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>
                    🚫 {item.food} + {item.med}
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>{item.note}</p>
                </div>
                <span className={`badge ${item.risk === 'high' ? 'badge-danger' : 'badge-warning'}`}>
                  {item.risk === 'high' ? '⚠️ High Risk' : '⚡ Medium Risk'}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
