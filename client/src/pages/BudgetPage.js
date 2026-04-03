import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';  // ✅ add this
import API from '../api';

const CATEGORIES = [
  { name: 'Food & Dining', color: '#FFB7B2', emoji: '🍜' },
  { name: 'Transport', color: '#E2F0CB', emoji: '🚌' },
  { name: 'Shopping', color: '#B5EAD7', emoji: '🛍️' },
  { name: 'Entertainment', color: '#C7CEEA', emoji: '🎬' },
  { name: 'Health', color: '#FFDAC1', emoji: '💊' },
  { name: 'Education', color: '#D4A5A5', emoji: '📚' },
  { name: 'Utilities', color: '#9DDCE0', emoji: '💡' },
  { name: 'Other', color: '#B0C4DE', emoji: '📦' },
];

const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  SGD: 'S$',
  CAD: 'CA$',
  AUD: 'A$',
  NZD: 'NZ$',
};

export default function BudgetPage({ onBack, expenses }) {
  const { user } = useAuth();  // ✅ get user from context
  const [budgets, setBudgets] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sw_budgets');
    if (stored) setBudgets(JSON.parse(stored));
  }, []);

  const currencySymbol = CURRENCY_SYMBOLS[user?.currency] || '₹';  // ✅ read from user

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
                  <span className="budget-rupee">{currencySymbol}</span>
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
                    <span>{currencySymbol}{spent.toLocaleString('en-IN')} spent</span>
                    {isOver && (
                      <span className="budget-over"><AlertTriangle size={12} /> Over by {currencySymbol}{(spent - budget).toLocaleString('en-IN')}</span>
                    )}
                    {isWarning && (
                      <span className="budget-warning"><AlertTriangle size={12} /> {Math.round(pct)}% used</span>
                    )}
                    {!isOver && !isWarning && (
                      <span className="budget-ok">{currencySymbol}{(budget - spent).toLocaleString('en-IN')} left</span>
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