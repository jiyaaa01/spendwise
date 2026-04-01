import React, { useState, useEffect, useCallback } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement
} from 'chart.js';
import {
  Plus, Trash2, TrendingUp, TrendingDown, Wallet,
  RefreshCw, ChevronDown, X, IndianRupee, ArrowLeftRight,
  LogOut, User, Download, Search, SlidersHorizontal, PiggyBank
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import API from './api';
import ProfilePage from './pages/ProfilePage';
import BudgetPage from './pages/BudgetPage';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

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

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD', 'CAD', 'AUD', 'NZD'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function App() {
  const { user, logout, updateCurrency } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [rates, setRates] = useState({});
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());
  const [activeYear, setActiveYear] = useState(new Date().getFullYear());
  const [deleteId, setDeleteId] = useState(null);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [page, setPage] = useState('dashboard'); // dashboard | profile | budget

  // Search & filter state
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterMin, setFilterMin] = useState('');
  const [filterMax, setFilterMax] = useState('');

  const [form, setForm] = useState({
    title: '', amount: '', currency: 'INR', category: CATEGORIES[0].name,
    date: new Date().toISOString().split('T')[0], note: ''
  });

  const [convAmount, setConvAmount] = useState('');
  const [convFrom, setConvFrom] = useState('INR');
  const [convTo, setConvTo] = useState('USD');

  const fetchExpenses = useCallback(async () => {
    setExpensesLoading(true);
    try {
      const res = await API.get(`/expenses?month=${activeMonth}&year=${activeYear}`);
      setExpenses(res.data);
    } catch (err) { console.error(err); }
    setExpensesLoading(false);
  }, [activeMonth, activeYear]);

  const fetchAllExpenses = useCallback(async () => {
    try {
      const res = await API.get('/expenses/all');
      setAllExpenses(res.data);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);
  useEffect(() => { fetchAllExpenses(); }, [fetchAllExpenses]);

  const fetchRates = useCallback(async () => {
    setRatesLoading(true); setRatesError(false);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/INR');
      const data = await res.json();
      if (data.rates) setRates(data.rates); else setRatesError(true);
    } catch { setRatesError(true); }
    setRatesLoading(false);
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);
  useEffect(() => { if (user?.currency) setCurrency(user.currency); }, [user]);

  const handleCurrencyChange = async (newCurrency) => {
    setCurrency(newCurrency);
    try { await updateCurrency(newCurrency); } catch (err) { console.error(err); }
  };

  const convert = (amount, from, to) => {
    if (!rates[from] || !rates[to]) return null;
    return ((amount / rates[from]) * rates[to]).toFixed(2);
  };

  const displayAmount = (amountINR) => {
    if (currency === 'INR') return `₹ ${Number(amountINR).toLocaleString('en-IN')}`;
    const converted = convert(amountINR, 'INR', currency);
    const sym = { USD:'$', EUR:'€', GBP:'£', AED:'د.إ', SGD:'S$', CAD:'CA$', AUD:'A$', NZD:'NZ$' }[currency] || currency + ' ';
    return converted ? `${sym} ${Number(converted).toLocaleString()}` : `₹ ${Number(amountINR).toLocaleString('en-IN')}`;
  };

  // Filtered transactions
  const filteredExpenses = expenses.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()) ||
      (e.note && e.note.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = filterCategory === 'All' || e.category === filterCategory;
    const matchMin = filterMin === '' || Number(e.amount) >= Number(filterMin);
    const matchMax = filterMax === '' || Number(e.amount) <= Number(filterMax);
    return matchSearch && matchCategory && matchMin && matchMax;
  });

  const totalMonthly = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const byCategory = CATEGORIES.map(c => ({
    ...c,
    total: expenses.filter(e => e.category === c.name).reduce((s, e) => s + Number(e.amount), 0)
  })).filter(c => c.total > 0);

  const monthlyTotals = MONTHS.map((_, i) =>
    allExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === i && d.getFullYear() === activeYear;
    }).reduce((s, e) => s + Number(e.amount), 0)
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return;
    try {
      let finalAmount = Number(form.amount);
      if (form.currency && form.currency !== 'INR') {
        const converted = convert(finalAmount, form.currency, 'INR');
        if (converted) {
          finalAmount = Number(converted);
        }
      }
      const res = await API.post('/expenses', { ...form, amount: finalAmount });
      setExpenses(prev => [res.data, ...prev]);
      setAllExpenses(prev => [res.data, ...prev]);
      setForm({ title: '', amount: '', currency: currency || 'INR', category: CATEGORIES[0].name, date: new Date().toISOString().split('T')[0], note: '' });
      setShowForm(false);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e._id !== id));
      setAllExpenses(prev => prev.filter(e => e._id !== id));
      setDeleteId(null);
    } catch (err) { console.error(err); }
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Title', 'Amount (INR)', 'Category', 'Date', 'Note'];
    const rows = allExpenses.map(e => [
      `"${e.title}"`,
      e.amount,
      `"${e.category}"`,
      new Date(e.date).toLocaleDateString('en-IN'),
      `"${e.note || ''}"`
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendwise_expenses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const catForName = (name) => CATEGORIES.find(c => c.name === name) || CATEGORIES[7];

  const doughnutData = {
    labels: byCategory.map(c => c.name),
    datasets: [{ data: byCategory.map(c => c.total), backgroundColor: byCategory.map(c => c.color), borderWidth: 0, hoverOffset: 8 }]
  };

  const barData = {
    labels: MONTHS,
    datasets: [{
      data: monthlyTotals,
      backgroundColor: MONTHS.map((_, i) => i === activeMonth ? '#6366F1' : '#E0E7FF'),
      borderRadius: 8, borderSkipped: false,
    }]
  };

  const convResult = convAmount && convert(Number(convAmount), convFrom, convTo);

  // Sub-pages
  if (page === 'profile') return <ProfilePage onBack={() => setPage('dashboard')} />;
  if (page === 'budget') return <BudgetPage onBack={() => setPage('dashboard')} expenses={allExpenses} />;

  return (
    <div className="app">
      <div className="noise" />

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon"><IndianRupee size={18} /></span>
          <span className="logo-text">SpendWise</span>
        </div>

        <div className="user-box">
          <div className="user-avatar"><User size={16} /></div>
          <div>
            <p className="user-name">{user?.name}</p>
            <p className="user-email">{user?.email}</p>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout"><LogOut size={15} /></button>
        </div>

        <div className="sidebar-balance">
          <p className="balance-label">This Month</p>
          <h2 className="balance-amount">{displayAmount(totalMonthly)}</h2>
          <p className="balance-sub">{expenses.length} transactions</p>
        </div>

        <div className="currency-box">
          <label className="currency-label">Display Currency</label>
          <div className="select-wrap">
            <select className="currency-select" value={currency} onChange={e => handleCurrencyChange(e.target.value)}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="select-icon" />
          </div>
          {ratesLoading && <p className="rates-status loading">Fetching rates...</p>}
          {ratesError && <p className="rates-status error">Rates unavailable · <button onClick={fetchRates}>retry</button></p>}
          {!ratesLoading && !ratesError && Object.keys(rates).length > 0 && <p className="rates-status ok">Live rates ✓</p>}
        </div>

        <div className="month-nav">
          <div className="month-nav-header">
            <p className="month-nav-label">Month</p>
            <div className="year-nav">
              <button onClick={() => setActiveYear(y => y - 1)}>‹</button>
              <span>{activeYear}</span>
              <button onClick={() => setActiveYear(y => y + 1)}>›</button>
            </div>
          </div>
          <div className="month-grid">
            {MONTHS.map((m, i) => (
              <button key={m} className={`month-btn ${i === activeMonth ? 'active' : ''}`} onClick={() => setActiveMonth(i)}>{m}</button>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <div className="sidebar-nav">
          <button className="nav-link" onClick={() => setPage('budget')}><PiggyBank size={15} /> Budget Limits</button>
          <button className="nav-link" onClick={() => setPage('profile')}><User size={15} /> Profile Settings</button>
          <button className="nav-link" onClick={() => setShowConverter(s => !s)}><ArrowLeftRight size={15} /> Currency Converter</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        <header className="top-bar">
          <div>
            <h1 className="page-title">Expenses</h1>
            <p className="page-sub">{MONTHS[activeMonth]} {activeYear}</p>
          </div>
          <div className="top-actions">
            <button className="icon-btn" onClick={exportCSV} title="Export CSV"><Download size={18} /></button>
            <button className="add-btn" onClick={() => { setForm(f => ({...f, currency: currency || 'INR'})); setShowForm(true); }}><Plus size={18} /> Add Expense</button>
          </div>
        </header>

        {/* Stats */}
        <div className="stats-row">
          <StatCard icon={<Wallet size={20} />} label="Total Spent" value={displayAmount(totalMonthly)} color="indigo" />
          <StatCard
            icon={<TrendingUp size={20} />}
            label="Biggest Category"
            value={byCategory.length ? `${catForName([...byCategory].sort((a,b)=>b.total-a.total)[0].name).emoji} ${[...byCategory].sort((a,b)=>b.total-a.total)[0].name}` : '—'}
            color="pink"
          />
          <StatCard
            icon={<TrendingDown size={20} />}
            label="Avg per Transaction"
            value={expenses.length ? displayAmount(totalMonthly / expenses.length) : '—'}
            color="amber"
          />
        </div>

        {/* Charts */}
        {expenses.length > 0 && (
          <div className="charts-row">
            <div className="chart-card">
              <h3 className="chart-title">By Category</h3>
              <div className="doughnut-wrap">
                <Doughnut data={doughnutData} options={{ plugins: { legend: { position: 'bottom', labels: { font: { family: 'DM Sans', size: 12 }, boxWidth: 12, padding: 16, color: '#64748B' } } }, cutout: '68%' }} />
              </div>
            </div>
            <div className="chart-card chart-card--wide">
              <h3 className="chart-title">Monthly Overview {activeYear}</h3>
              <Bar data={barData} options={{
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { family: 'DM Sans', size: 11 }, color: '#94A3B8' } },
                  y: { grid: { color: '#F1F5F9' }, ticks: { font: { family: 'DM Sans', size: 11 }, color: '#94A3B8', callback: v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}` } }
                },
              }} />
            </div>
          </div>
        )}

        {/* Search & Filter bar */}
        <div className="search-bar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input className="search-input" placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
          </div>
          <button className={`filter-toggle ${showFilters ? 'active' : ''}`} onClick={() => setShowFilters(s => !s)}>
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label>Category</label>
              <div className="select-wrap filter-select-wrap">
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option>All</option>
                  {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
                </select>
                <ChevronDown size={13} className="select-icon" />
              </div>
            </div>
            <div className="filter-group">
              <label>Min Amount (₹)</label>
              <input type="number" placeholder="0" value={filterMin} onChange={e => setFilterMin(e.target.value)} className="filter-input" />
            </div>
            <div className="filter-group">
              <label>Max Amount (₹)</label>
              <input type="number" placeholder="Any" value={filterMax} onChange={e => setFilterMax(e.target.value)} className="filter-input" />
            </div>
            <button className="filter-clear" onClick={() => { setFilterCategory('All'); setFilterMin(''); setFilterMax(''); }}>
              Clear Filters
            </button>
          </div>
        )}

        {/* Transactions */}
        <div className="transactions-section">
          <div className="section-header">
            <h3 className="section-title">Transactions</h3>
            <span className="tx-count">{filteredExpenses.length} of {expenses.length}</span>
          </div>

          {expensesLoading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : filteredExpenses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-emoji">{search || filterCategory !== 'All' ? '🔍' : '💸'}</span>
              <p>{search || filterCategory !== 'All' ? 'No matching transactions' : 'No expenses this month'}</p>
              {!search && filterCategory === 'All' && (
                <button className="add-btn-sm" onClick={() => { setForm(f => ({...f, currency: currency || 'INR'})); setShowForm(true); }}>Add your first expense</button>
              )}
            </div>
          ) : (
            <div className="tx-list">
              {filteredExpenses.map(exp => {
                const cat = catForName(exp.category);
                return (
                  <div key={exp._id} className="tx-item">
                    <div className="tx-cat-dot" style={{ background: cat.color }}>{cat.emoji}</div>
                    <div className="tx-info">
                      <p className="tx-title">{exp.title}</p>
                      <p className="tx-meta">{exp.category} · {new Date(exp.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</p>
                    </div>
                    {exp.note && <p className="tx-note">{exp.note}</p>}
                    <div className="tx-right">
                      <p className="tx-amount">{displayAmount(exp.amount)}</p>
                      <button className="tx-delete" onClick={() => setDeleteId(exp._id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ADD EXPENSE MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Expense</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="expense-form">
              <div className="form-group">
                <label>Title</label>
                <input placeholder="e.g. Lunch at Subway" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                      value={form.currency || 'INR'} 
                      onChange={e => setForm(f => ({...f, currency: e.target.value}))}
                      style={{ padding: '10px 8px', borderRadius: '10px', border: '1.5px solid var(--border)', background: '#FAFAFA', outline: 'none', fontFamily: '"DM Sans", sans-serif', color: 'var(--text)' }}
                    >
                      {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input type="number" placeholder="0.00" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} required style={{ flex: 1, minWidth: 0 }} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} required />
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <div className="cat-grid">
                  {CATEGORIES.map(c => (
                    <button type="button" key={c.name}
                      className={`cat-chip ${form.category === c.name ? 'active' : ''}`}
                      style={form.category === c.name ? { background: c.color, color: '#fff', borderColor: c.color } : {}}
                      onClick={() => setForm(f => ({...f, category: c.name}))}>
                      {c.emoji} {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Note (optional)</label>
                <input placeholder="Any details..." value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} />
              </div>
              <button type="submit" className="submit-btn">Add Expense</button>
            </form>
          </div>
        </div>
      )}

      {/* CURRENCY CONVERTER */}
      {showConverter && (
        <div className="converter-panel">
          <div className="converter-header">
            <h3><ArrowLeftRight size={16} /> Converter</h3>
            <button onClick={() => setShowConverter(false)}><X size={16} /></button>
          </div>
          <input className="conv-input" type="number" placeholder="Amount" value={convAmount} onChange={e => setConvAmount(e.target.value)} />
          <div className="conv-row">
            <div className="select-wrap">
              <select value={convFrom} onChange={e => setConvFrom(e.target.value)}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select>
              <ChevronDown size={12} className="select-icon" />
            </div>
            <button className="swap-btn" onClick={() => { setConvFrom(convTo); setConvTo(convFrom); }}><RefreshCw size={14} /></button>
            <div className="select-wrap">
              <select value={convTo} onChange={e => setConvTo(e.target.value)}>{CURRENCIES.map(c => <option key={c}>{c}</option>)}</select>
              <ChevronDown size={12} className="select-icon" />
            </div>
          </div>
          {convResult && (
            <div className="conv-result">
              <span className="conv-from-val">{convAmount} {convFrom}</span>
              <span className="conv-eq">=</span>
              <span className="conv-to-val">{convResult} {convTo}</span>
            </div>
          )}
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <h3>Delete this expense?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirm-btns">
              <button className="cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="danger-btn" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}