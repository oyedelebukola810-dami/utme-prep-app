import React from 'react';
import { Home, BookOpen, Timer, BarChart3, User, ShieldCheck } from 'lucide-react';
import './Navigation.css';

export const BottomNav = ({ activeTab = 'home', onTabChange, user }) => {
  const baseTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'practice', label: 'Practice', icon: BookOpen },
    { id: 'cbt', label: 'UTME Exam', icon: Timer },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (user?.is_admin || activeTab === 'admin') {
    baseTabs.splice(3, 0, { id: 'admin', label: 'Admin', icon: ShieldCheck });
  }

  const tabs = baseTabs;

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
