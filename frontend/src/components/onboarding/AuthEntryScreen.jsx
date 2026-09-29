import React, { useState, useEffect } from 'react';
import { Mail, Key, User, ArrowRight, ShieldCheck, ShieldAlert, CheckCircle2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { apiRequest } from '../../services/apiClient';
import './AuthEntryScreen.css';

export const AuthEntryScreen = ({ onCompleteGuest }) => {
  const [authView, setAuthView] = useState('landing'); // 'landing' | 'login' | 'register' | 'verify' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [targetScore, setTargetScore] = useState(320);
  const [verificationTokenInput, setVerificationTokenInput] = useState('');
  
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const data = await apiRequest('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          target_score: Number(targetScore)
        })
      });

      setStatusMessage(data.message);
      setAuthView('verify');
      setResendCooldown(60);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const data = await apiRequest('/api/v1/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ token: verificationTokenInput })
      });

      setStatusMessage('Email address verified successfully. You may now sign in.');
      setAuthView('login');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const data = await apiRequest('/api/v1/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      setStatusMessage(data.message);
      setResendCooldown(60);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const data = await apiRequest('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, full_name: 'Candidate' })
      });

      const userData = { email, name: fullName || 'Candidate', is_verified: true, token: data.access_token };
      onCompleteGuest && onCompleteGuest(userData);
    } catch (err) {
      if (err.status === 403) {
        setAuthView('verify');
      }
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const data = await apiRequest('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });

      setStatusMessage(data.message);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-entry-container">
      <div className="auth-entry-header">
        <div className="auth-logo-brand">
          <svg className="auth-logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="10" fill="#29235C"/>
            <path d="M 12 12 L 28 12 C 30 12 31 13.5 30 15 L 21 28 C 20 29.5 19 29.5 18 28 L 9 15 C 8 13.5 9.5 12 12 12 Z" fill="#C7F36B"/>
          </svg>
          <span className="auth-brand-name">UTME Prep</span>
        </div>
        <Badge variant="lime" size="sm">2026 Engine</Badge>
      </div>

      {statusMessage && (
        <div className="auth-alert success">
          <CheckCircle2 size={16} /> <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="auth-alert error">
          <ShieldAlert size={16} /> <span>{errorMessage}</span>
        </div>
      )}

      {authView === 'landing' && (
        <div className="auth-landing-view">
          <div className="auth-hero-text">
            <h1 className="auth-headline">Next-Gen UTME Preparation</h1>
            <p className="auth-subtext">
              Authentic 4-subject CBT simulation, timed practice engine, and topic-by-topic solution breakdowns.
            </p>
          </div>

          <div className="auth-actions-group">
            <Button
              variant="accent"
              fullWidth
              size="lg"
              onClick={() => { setAuthView('register'); setErrorMessage(null); setStatusMessage(null); }}
              rightIcon={<ArrowRight size={18} />}
            >
              Create Candidate Account
            </Button>

            <Button
              variant="outline"
              fullWidth
              size="lg"
              style={{ color: 'var(--color-white)', borderColor: 'var(--border-subtle)' }}
              onClick={() => { setAuthView('login'); setErrorMessage(null); setStatusMessage(null); }}
            >
              Sign In to Account
            </Button>

            <button
              type="button"
              className="guest-link-btn"
              onClick={() => onCompleteGuest && onCompleteGuest({ name: 'Guest Candidate', is_verified: false })}
            >
              Continue in Guest Mode
            </button>
          </div>
        </div>
      )}

      {authView === 'register' && (
        <form className="auth-form-view" onSubmit={handleRegister}>
          <div className="form-header">
            <h2>Create Account</h2>
            <p>Email ownership verification is required for account activation.</p>
          </div>

          <div className="form-field">
            <label><User size={14} /> Full Name</label>
            <input
              type="text"
              placeholder="e.g. Chisom Okonkwo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label><Mail size={14} /> Email Address</label>
            <input
              type="email"
              placeholder="candidate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label><Key size={14} /> Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label>Target UTME Score (Max 400)</label>
            <input
              type="number"
              min="200"
              max="400"
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              required
            />
          </div>

          <div className="form-actions">
            <Button variant="accent" fullWidth size="lg" type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register Candidate Account'}
            </Button>

            <button
              type="button"
              className="form-toggle-btn"
              onClick={() => { setAuthView('login'); setErrorMessage(null); setStatusMessage(null); }}
            >
              Already have an account? Sign In
            </button>

            <button
              type="button"
              className="guest-link-btn"
              onClick={() => setAuthView('landing')}
            >
              Back to Overview
            </button>
          </div>
        </form>
      )}

      {authView === 'verify' && (
        <form className="auth-form-view verification-form-view" onSubmit={handleVerify}>
          <div className="form-header text-center">
            <div className="verify-icon-wrapper">
              <Mail size={32} color="var(--color-electric-lime)" />
            </div>
            <h2>Check Your Email</h2>
            <p className="verify-dest-text">
              We dispatched a single-use verification link to <span className="highlight-email">{email || 'your registered email'}</span>.
            </p>
          </div>

          <div className="form-field">
            <label><ShieldCheck size={14} /> Enter Verification Token</label>
            <input
              type="text"
              placeholder="Paste 32-character verification token"
              value={verificationTokenInput}
              onChange={(e) => setVerificationTokenInput(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <Button variant="accent" fullWidth size="lg" type="submit" disabled={loading}>
              {loading ? 'Verifying Token...' : 'Verify Email Address'}
            </Button>

            <Button
              variant="secondary"
              fullWidth
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || loading}
              leftIcon={<RefreshCw size={14} />}
            >
              {resendCooldown > 0 ? `Resend Cooldown (${resendCooldown}s)` : 'Resend Verification Token'}
            </Button>

            <div className="verify-secondary-actions">
              <button
                type="button"
                className="verify-sublink"
                onClick={() => { setAuthView('register'); setErrorMessage(null); setStatusMessage(null); }}
              >
                Change Email Address
              </button>
              <span className="divider-bullet">•</span>
              <button
                type="button"
                className="verify-sublink"
                onClick={() => { setAuthView('login'); setErrorMessage(null); setStatusMessage(null); }}
              >
                Return to Sign In
              </button>
            </div>
          </div>
        </form>
      )}

      {authView === 'login' && (
        <form className="auth-form-view" onSubmit={handleLogin}>
          <div className="form-header">
            <h2>Sign In</h2>
            <p>Access your verified candidate account and CBT performance analytics.</p>
          </div>

          <div className="form-field">
            <label><Mail size={14} /> Email Address</label>
            <input
              type="email"
              placeholder="candidate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <div className="label-with-forgot">
              <label><Key size={14} /> Password</label>
              <button
                type="button"
                className="forgot-link-btn"
                onClick={() => { setAuthView('forgot'); setErrorMessage(null); setStatusMessage(null); }}
              >
                Forgot password?
              </button>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-actions">
            <Button variant="accent" fullWidth size="lg" type="submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </Button>

            <button
              type="button"
              className="form-toggle-btn"
              onClick={() => { setAuthView('register'); setErrorMessage(null); setStatusMessage(null); }}
            >
              Need an account? Register Candidate Account
            </button>

            <button
              type="button"
              className="guest-link-btn"
              onClick={() => setAuthView('landing')}
            >
              Back to Overview
            </button>
          </div>
        </form>
      )}

      {authView === 'forgot' && (
        <form className="auth-form-view" onSubmit={handleForgotPassword}>
          <div className="form-header">
            <h2>Reset Password</h2>
            <p>Enter your registered email address to receive password reset instructions.</p>
          </div>

          <div className="form-field">
            <label><Mail size={14} /> Registered Email Address</label>
            <input
              type="email"
              placeholder="candidate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <Button variant="accent" fullWidth size="lg" type="submit" disabled={loading}>
              {loading ? 'Sending Request...' : 'Send Password Reset Link'}
            </Button>

            <button
              type="button"
              className="form-toggle-btn"
              onClick={() => { setAuthView('login'); setErrorMessage(null); setStatusMessage(null); }}
            >
              Return to Sign In
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
