import React from 'react';
import { ShieldCheck, RotateCcw, User, LogOut } from 'lucide-react';
import './Header.css';

/**
 * Responsive Header Component
 * Spans full viewport width with inner container aligned to max content width.
 */
export const Header = ({ user, onReplayTour, onLogout, onOpenAuth }) => {
  return (
    <header className="app-header-bar">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo-container">
            <svg className="header-logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="10" fill="#29235C"/>
              <path d="M 12 12 L 28 12 C 30 12 31 13.5 30 15 L 21 28 C 20 29.5 19 29.5 18 28 L 9 15 C 8 13.5 9.5 12 12 12 Z" fill="#C7F36B"/>
            </svg>
          </div>
          <div className="header-titles">
            <span className="header-title">UTME Prep</span>
            <span className="header-badge">2026 CBT Engine</span>
          </div>
        </div>

        <div className="header-actions">
          {user ? (
            <div className="user-profile-header">
              <span className="user-email">{user.email}</span>
              {user.is_verified ? (
                <span className="verification-status verified" title="Email Verified">
                  <ShieldCheck size={14} /> Verified
                </span>
              ) : (
                <span className="verification-status unverified" title="Email Unverified">
                  Pending Verification
                </span>
              )}
              <button
                type="button"
                className="header-icon-btn"
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="auth-btn-header"
              onClick={onOpenAuth}
            >
              <User size={15} /> Sign In
            </button>
          )}

          <button
            type="button"
            className="tour-btn-header"
            onClick={onReplayTour}
            title="Replay Onboarding Tour"
          >
            <RotateCcw size={14} /> <span className="tour-text">Tour</span>
          </button>
        </div>
      </div>
    </header>
  );
};
