import React from 'react';
import { Home, BookOpen, Timer, BarChart3, User } from 'lucide-react';
import './Navigation.css';

/**
 * Responsive Navigation Component
 * Modern 2026 bottom tab bar for mobile, adapting seamlessly on desktop
 */
export const BottomNav = ({ activeTab = 'home', onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'practice', label: 'Practice', icon: BookOpen },
    { id: 'cbt', label: 'UTME Exam', icon: Timer },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="bottom-nav-bar">
      <div className="nav-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange && onTabChange(tab.id)}
              type="button"
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
