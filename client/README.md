# 💸 SpendWise – Expense Tracker

A polished, fully responsive expense tracker built with React. Track your spending by category, visualise monthly trends, and convert currencies in real time.

![SpendWise Preview](https://via.placeholder.com/900x500/6366F1/ffffff?text=SpendWise+Expense+Tracker)

## ✨ Features

- **Add & categorise expenses** — 8 categories with emoji labels
- **Monthly overview** — bar chart showing all 12 months at a glance
- **Category breakdown** — doughnut chart for spending distribution
- **Live currency conversion** — powered by ExchangeRate API (INR, USD, EUR, GBP, AED, SGD, CAD, AUD)
- **Persistent storage** — all data saved in localStorage, survives page refresh
- **Fully responsive** — works on mobile, tablet, and desktop
- **Clean, modern UI** — Syne + DM Sans typography, smooth animations

## 🛠️ Tech Stack

- **React 18** (hooks: useState, useEffect, useCallback)
- **Chart.js + react-chartjs-2** for data visualisation
- **Lucide React** for icons
- **ExchangeRate API** for live currency rates
- **localStorage** for data persistence
- **CSS custom properties** for theming

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/spendwise.git
cd spendwise

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

```bash
npm run build
```

Deploy the `build/` folder to Netlify, Vercel, or GitHub Pages.

## 🌐 Live Demo

[View Live →](https://YOUR_NETLIFY_URL.netlify.app)

## 📁 Project Structure

```
src/
├── App.js          # Main app component, all logic
├── App.css         # Styles with CSS variables
└── index.js        # Entry point
```

## 🔑 API Used

- [ExchangeRate API](https://open.er-api.com) — free, no API key required

## 👩‍💻 Author

**Jiya Chauhan** — [Portfolio](https://chauhanjiya-portfolio.netlify.app) · [GitHub](https://github.com/jiyaaa01) · [LinkedIn](https://linkedin.com/in/jiya-chauhan-5a4438322)

---

⭐ If you found this useful, consider starring the repo!