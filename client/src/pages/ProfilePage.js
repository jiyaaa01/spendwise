import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ArrowLeft, Check } from 'lucide-react';
import API from '../api';

export default function ProfilePage({ onBack }) {
  const { user, updateCurrency } = useAuth();
  const [tab, setTab] = useState('profile');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const showSuccess = (msg) => { setSuccess(msg); setError(''); setTimeout(() => setSuccess(''), 3000); };
  const showError = (msg) => { setError(msg); setSuccess(''); };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put('/auth/profile', profileForm);
      showSuccess('Profile updated successfully!');
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      return showError('New passwords do not match');
    if (passwordForm.newPassword.length < 6)
      return showError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await API.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showSuccess('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update password');
    }
    setLoading(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={18} /> Back</button>
        <h1 className="page-title">Profile Settings</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-lg">
          <User size={32} />
        </div>
        <h2 className="profile-name">{user?.name}</h2>
        <p className="profile-email-text">{user?.email}</p>
      </div>

      <div className="profile-tabs">
        <button className={`profile-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
          <User size={16} /> Personal Info
        </button>
        <button className={`profile-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
          <Lock size={16} /> Change Password
        </button>
      </div>

      {success && <div className="alert alert--success"><Check size={16} /> {success}</div>}
      {error && <div className="alert alert--error">{error}</div>}

      {tab === 'profile' && (
        <form onSubmit={handleProfileUpdate} className="profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePasswordUpdate} className="profile-form">
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(f => ({ ...f, currentPassword: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" placeholder="Min. 6 characters" value={passwordForm.newPassword} onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}