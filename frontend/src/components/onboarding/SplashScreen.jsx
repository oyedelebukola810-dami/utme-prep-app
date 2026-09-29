import React, { useEffect } from 'react';
import './SplashScreen.css';

/**
 * Screen 1: Splash Screen Component
 * Renders high-impact brand entry with logo aspect ratio preserved
 */
export const SplashScreen = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish && onFinish();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="splash-container">
      <div className="splash-content">
        <div className="splash-logo-wrapper">
          <svg className="splash-logo-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="24" fill="#29235C"/>
            <path d="M 28 30 L 72 30 C 76 30 78 33 76 37 L 54 70 C 52 73 48 73 46 70 L 24 37 C 22 33 24 30 28 30 Z" fill="#C7F36B"/>
            <circle cx="50" cy="48" r="12" fill="#171536"/>
            <path d="M 44 48 L 48 52 L 56 44" stroke="#C7F36B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="splash-title">UTME PREP</h1>
        <p className="splash-subtitle">2026 NEXT-GEN CBT ENGINE</p>

        <div className="splash-loader">
          <div className="splash-loader-bar"></div>
        </div>
      </div>
    </div>
  );
};
