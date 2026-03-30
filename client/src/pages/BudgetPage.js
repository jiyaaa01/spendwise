import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import API from '../api';

const CATEGORIES = [
  { name: 'Food & Dining',  color: '#FF6B6B', emoji: '🍜' },
  { name: 'Transport',      color: '#FFD93D', emoji: '🚌' },
  { name: 'Shopping',       color: '#6BCB77', emoji: '🛍️' },
  { name: 'Entertainment',  color: '#4D96FF', emoji: '🎬' },
  { name: 'Health',         color: '#FF9F1C', emoji: '💊' },
  { name: 'Education',      color: '#A855F7', emoji: '📚' },
  { name: 'Utilities',      color: '#06B6D4', emoji: '💡' },
  { name: 'Other',          color: '#94A3B8', emoji: '📦' },
];

export default function BudgetPage({ onBack, expenses }) {
  const [budgets, setBudgets] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sw_budgets');
    if (stored) setBudgets(JSON.parse(stored));
  }, []);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlySpend = (category) =>
    expenses.filter(e => {
      const d = new Date(e.date);
      return e.category === category && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((s, e) => s + Number(e.amount), 0);

  const handleSave = () => {
    localStorage.setItem('sw_budgets', JSON.stringify(budgets));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={18} /> Back</button>
        <h1 className="page-title">Monthly Budgets</h1>
      </div>

      <p className="budget-sub">Set spending limits for each category. You'll see a warning when you're over 80%.</p>

      {saved && <div className="alert alert--success"><span>✓</span> Budgets saved!</div>}

      <div className="budget-list">
        {CATEGORIES.map(cat => {
          const spent = monthlySpend(cat.name);
          const budget = Number(budgets[cat.name] || 0);
          const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
          const isOver = budget > 0 && spent > budget;
          const isWarning = budget > 0 && pct >= 80 && !isOver;

          return (
            <div key={cat.name} className="budget-item">
              <div className="budget-item-top">
                <div className="budget-cat">
                  <span className="budget-emoji">{cat.emoji}</span>
                  <span className="budget-cat-name">{cat.name}</span>
                </div>
                <div className="budget-input-wrap">
                  <span className="budget-rupee">₹</span>
                  <input
                    type="number"
                    className="budget-input"
                    placeholder="0"
                    value={budgets[cat.name] || ''}
                    onChange={e => setBudgets(b => ({ ...b, [cat.name]: e.target.value }))}
                    min="0"
                  />
                </div>
              </div>

              {budget > 0 && (
                <>
                  <div className="budget-bar-bg">
                    <div
                      className="budget-bar-fill"
                      style={{
                        width: `${pct}%`,
                        background: isOver ? '#EF4444' : isWarning ? '#F59E0B' : cat.color
                      }}
                    />
                  </div>
                  <div className="budget-meta">
                    <span>₹{spent.toLocaleString('en-IN')} spent</span>
                    {isOver && (
                      <span className="budget-over"><AlertTriangle size={12} /> Over by ₹{(spent - budget).toLocaleString('en-IN')}</span>
                    )}
                    {isWarning && (
                      <span className="budget-warning"><AlertTriangle size={12} /> {Math.round(pct)}% used</span>
                    )}
                    {!isOver && !isWarning && (
                      <span className="budget-ok">₹{(budget - spent).toLocaleString('en-IN')} left</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <button className="submit-btn budget-save-btn" onClick={handleSave}>
        <Save size={16} /> Save Budgets
      </button>
    </div>
  );
}