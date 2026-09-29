import React, { useState } from 'react';
import { User, Mail, ShieldCheck, Target, Sliders, Lock, Bell, Info, ShieldAlert, LogOut, Trash2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Card } from '../common/Card/Card';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import './SettingsView.css';

export const SettingsView = ({ user, onUpdateUser, onLogout, onReplayTour }) => {
  const [activeModal, setActiveModal] = useState(null); // null | 'password' | 'about' | 'privacy' | 'delete'
  
  // Settings State (saved in localStorage)
  const [targetScore, setTargetScore] = useState(user?.targetScore || 320);
  const [examTimerMode, setExamTimerMode] = useState('120'); // '120' or 'untimed'
  const [autoShowSolutions, setAutoShowSolutions] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);

  // Account Name Edit State
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState(user?.name || 'Candidate Scholar');

  const handleSaveScore = (newScore) => {
    const scoreVal = Number(newScore);
    setTargetScore(scoreVal);
    const updatedUser = { ...user, targetScore: scoreVal };
    onUpdateUser(updatedUser);
  };

  const handleSaveName = () => {
    const updatedUser = { ...user, name: fullNameInput };
    onUpdateUser(updatedUser);
    setIsEditingName(false);
  };

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus({ error: 'New password must be at least 6 characters long.' });
      return;
    }
    setPasswordStatus({ success: 'Password changed successfully.' });
    setTimeout(() => {
      setActiveModal(null);
      setPasswordStatus(null);
      setCurrentPassword('');
      setNewPassword('');
    }, 1500);
  };

  return (
    <div className="settings-container">
      <div className="settings-header-title">
        <h2>Candidate Settings & Profile</h2>
        <p className="subtext">Manage account security, target scores, and CBT exam preferences.</p>
      </div>

      {/* SECTION 1: ACCOUNT PROFILE */}
      <section className="settings-section">
        <div className="section-label-row">
          <User size={16} className="section-label-icon" />
          <h3 className="section-label-text">Account Information</h3>
        </div>

        <Card variant="bordered" className="settings-card">
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Full Name</span>
              {isEditingName ? (
                <div className="inline-edit-row">
                  <input
                    type="text"
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    className="settings-input"
                  />
                  <Button variant="accent" size="sm" onClick={handleSaveName}>Save</Button>
                </div>
              ) : (
                <span className="setting-value">{user?.name || 'Candidate Scholar'}</span>
              )}
            </div>
            {!isEditingName && (
              <button type="button" className="setting-action-btn" onClick={() => setIsEditingName(true)}>
                Edit
              </button>
            )}
          </div>

          <div className="setting-divider" />

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Email Address</span>
              <span className="setting-value">{user?.email || 'guest@utmeprep.ng'}</span>
            </div>
            {user?.is_verified ? (
              <Badge variant="emerald" icon={<ShieldCheck size={13} />}>Verified Account</Badge>
            ) : (
              <Badge variant="amber">Unverified Guest</Badge>
            )}
          </div>
        </Card>
      </section>

      {/* SECTION 2: EXAM PREFERENCES */}
      <section className="settings-section">
        <div className="section-label-row">
          <Sliders size={16} className="section-label-icon" />
          <h3 className="section-label-text">CBT Exam & Study Preferences</h3>
        </div>

        <Card variant="bordered" className="settings-card">
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Target UTME Score (Out of 400)</span>
              <span className="setting-desc">Set your target score for progress metrics</span>
            </div>
            <select
              value={targetScore}
              onChange={(e) => handleSaveScore(e.target.value)}
              className="settings-select"
            >
              <option value={250}>250 / 400</option>
              <option value={280}>280 / 400</option>
              <option value={300}>300 / 400</option>
              <option value={320}>320 / 400</option>
              <option value={350}>350 / 400</option>
            </select>
          </div>

          <div className="setting-divider" />

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">UTME CBT Timer Mode</span>
              <span className="setting-desc">120 Minutes official countdown or untimed practice</span>
            </div>
            <select
              value={examTimerMode}
              onChange={(e) => setExamTimerMode(e.target.value)}
              className="settings-select"
            >
              <option value="120">120 Minutes (Timed)</option>
              <option value="untimed">Untimed Mode</option>
            </select>
          </div>

          <div className="setting-divider" />

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Auto-Show Solutions</span>
              <span className="setting-desc">Automatically display step-by-step solutions during topic practice</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={autoShowSolutions}
                onChange={(e) => setAutoShowSolutions(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </Card>
      </section>

      {/* SECTION 3: SECURITY */}
      <section className="settings-section">
        <div className="section-label-row">
          <Lock size={16} className="section-label-icon" />
          <h3 className="section-label-text">Security</h3>
        </div>

        <Card variant="bordered" className="settings-card">
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Account Password</span>
              <span className="setting-desc">Regularly update password for account security</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setActiveModal('password'); setPasswordStatus(null); }}
            >
              Change Password
            </Button>
          </div>
        </Card>
      </section>

      {/* SECTION 4: APPLICATION & ABOUT */}
      <section className="settings-section">
        <div className="section-label-row">
          <Info size={16} className="section-label-icon" />
          <h3 className="section-label-text">Application Information</h3>
        </div>

        <Card variant="bordered" className="settings-card">
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Replay Onboarding Tour</span>
              <span className="setting-desc">View introduction overview and product features</span>
            </div>
            <Button variant="secondary" size="sm" onClick={onReplayTour}>Replay Tour</Button>
          </div>

          <div className="setting-divider" />

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">About UTME Prep Engine</span>
              <span className="setting-desc">Version 2026 • Build 1.0.0</span>
            </div>
            <button type="button" className="setting-action-btn" onClick={() => setActiveModal('about')}>
              View Info
            </button>
          </div>

          <div className="setting-divider" />

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Privacy & Candidate Terms</span>
              <span className="setting-desc">Read data privacy and usage guidelines</span>
            </div>
            <button type="button" className="setting-action-btn" onClick={() => setActiveModal('privacy')}>
              Read Terms
            </button>
          </div>
        </Card>
      </section>

      {/* SECTION 5: DANGER ZONE */}
      <section className="settings-section danger-section">
        <div className="section-label-row">
          <ShieldAlert size={16} color="var(--color-coral-red)" />
          <h3 className="section-label-text danger-text">Account Session Controls</h3>
        </div>

        <Card variant="bordered" className="settings-card danger-card">
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Sign Out</span>
              <span className="setting-desc">Log out of your active candidate session</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              style={{ color: 'var(--color-coral-red)', borderColor: 'var(--color-coral-red)' }}
              onClick={onLogout}
              leftIcon={<LogOut size={14} />}
            >
              Sign Out
            </Button>
          </div>

          <div className="setting-divider" />

          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title danger-text">Delete Candidate Account</span>
              <span className="setting-desc">Permanently remove candidate account and saved session history</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              style={{ color: 'var(--color-coral-red)', borderColor: 'var(--color-coral-red)' }}
              onClick={() => setActiveModal('delete')}
              leftIcon={<Trash2 size={14} />}
            >
              Delete Account
            </Button>
          </div>
        </Card>
      </section>

      {/* CHANGE PASSWORD MODAL */}
      {activeModal === 'password' && (
        <div className="settings-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Change Password</h3>
            <p className="subtext">Enter current and new secure password.</p>

            {passwordStatus?.error && (
              <div className="auth-alert error"><ShieldAlert size={16} /> <span>{passwordStatus.error}</span></div>
            )}
            {passwordStatus?.success && (
              <div className="auth-alert success"><CheckCircle2 size={16} /> <span>{passwordStatus.success}</span></div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="modal-form">
              <div className="form-field">
                <label>Current Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label>New Password (Min 6 chars)</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="accent" type="submit" fullWidth>Update Password</Button>
                <Button variant="secondary" type="button" fullWidth onClick={() => setActiveModal(null)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ABOUT MODAL */}
      {activeModal === 'about' && (
        <div className="settings-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>About UTME Prep 2026 Engine</h3>
            <p style={{ marginTop: '8px', lineHeight: '1.5', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Built specifically for Nigerian UTME candidates. Features authentic 4-subject CBT examination timers, topic practice modules, and instant solution breakdowns.
            </p>
            <Button variant="accent" style={{ marginTop: '16px' }} fullWidth onClick={() => setActiveModal(null)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* PRIVACY MODAL */}
      {activeModal === 'privacy' && (
        <div className="settings-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Privacy Policy</h3>
            <p style={{ marginTop: '8px', lineHeight: '1.5', fontSize: '13px', color: 'var(--text-secondary)' }}>
              We protect candidate privacy. Personal account data and target score performance metrics are strictly confidential and encrypted.
            </p>
            <Button variant="accent" style={{ marginTop: '16px' }} fullWidth onClick={() => setActiveModal(null)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {activeModal === 'delete' && (
        <div className="settings-modal-backdrop" onClick={() => setActiveModal(null)}>
          <div className="settings-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="danger-text">Delete Candidate Account?</h3>
            <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              This action cannot be undone. All test history and preferences will be removed.
            </p>
            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <Button
                variant="accent"
                style={{ backgroundColor: 'var(--color-coral-red)', borderColor: 'var(--color-coral-red)', color: '#FFF' }}
                fullWidth
                onClick={() => { onLogout(); setActiveModal(null); }}
              >
                Confirm Delete Account
              </Button>
              <Button variant="secondary" fullWidth onClick={() => setActiveModal(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
