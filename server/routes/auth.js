const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill all fields' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      currency: user.currency, token: generateToken(user._id)
    });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please fill all fields' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    res.json({
      _id: user._id, name: user.name, email: user.email,
      currency: user.currency, token: generateToken(user._id)
    });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => { res.json(req.user); });

// @route   PUT /api/auth/currency
router.put('/currency', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id, { currency: req.body.currency }, { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// @route   PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ message: 'Name and email are required' });
    const emailExists = await User.findOne({ email, _id: { $ne: req.user._id } });
    if (emailExists) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.findByIdAndUpdate(
      req.user._id, { name, email }, { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

// @route   PUT /api/auth/password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Please fill all fields' });
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
});

module.exports = router;