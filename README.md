# 💸 SpendWise – Full Stack Expense Tracker

SpendWise is a modern full-stack expense tracking web application that helps users manage their daily expenses, monitor spending habits, and stay financially organized.

---

## 🌐 Live Demo

🔗 **Live Website:** https://spendwise-cbv4.onrender.com

---

## 🚀 Features

* 🔐 User Authentication (Signup & Login)
* 💰 Add, update, and delete expenses
* 📊 Track personal spending
* 🧾 Organized expense records
* ⚡ Fast and responsive UI
* 🌍 Full-stack deployment (Frontend + Backend)

---

## 🛠️ Tech Stack

### 🎨 Frontend

* React.js
* CSS

### ⚙️ Backend

* Node.js
* Express.js

### 🗄️ Database

* MongoDB (Atlas)

### ☁️ Deployment

* Backend + Frontend hosted on Render

---

## 📁 Project Structure

```id="t7x2pw"
spendwise/
│
├── client/        # React frontend
│   └── build/     # Production build
│
├── server/        # Express backend
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation & Setup (Local)

### 1️⃣ Clone the repository

```id="x9m2kd"
git clone https://github.com/jiyaaa01/spendwise.git
cd spendwise
```

---

### 2️⃣ Setup Backend

```id="k2n8zd"
cd server
npm install
```

Create `.env` file in `server/`:

```id="v4z1px"
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

Run backend:

```id="d8m3jq"
npm start
```

---

### 3️⃣ Setup Frontend

```id="g7x9ar"
cd client
npm install
npm start
```

---

## 🚀 Deployment

This project is deployed on Render as a full-stack application.

### Key Setup:

* Frontend build served via Express
* Environment variables configured on Render
* MongoDB Atlas used as cloud database

---

## ⚠️ Important Notes

* Replace `localhost` API URLs with your deployed backend URL in production
* `.env` file should never be pushed to GitHub
* Render free tier may take time to wake up after inactivity

---

## 🔮 Future Improvements

* 📈 Expense analytics & charts
* 📅 Monthly reports
* 💳 Budget tracking
* 🔔 Notifications
* 🌙 Dark mode

---

## 👩‍💻 Author

Developed by **Chauhan** 💖

---

## 📄 License

This project is open-source and free to use.
