import React from 'react';
import { CheckCircle2, Clock, Award, BookOpen, Layers, ShieldCheck, BarChart3 } from 'lucide-react';
import './OnboardingGraphics.css';

/**
 * Screen 1 Graphic: Introduction Visual Composition
 */
export const GraphicWelcome = () => (
  <div className="graphic-container welcome-graphic">
    <div className="mock-card hero-mock">
      <div className="mock-badge">2026 UTME ENGINE</div>
      <div className="mock-header-row">
        <span className="mock-title">JAMB CBT Simulation</span>
        <span className="mock-tag"><ShieldCheck size={14} /> Official Format</span>
      </div>
      <div className="mock-stats-row">
        <div className="mock-stat-item">
          <span className="stat-num">4</span>
          <span className="stat-lbl">UTME Subjects</span>
        </div>
        <div className="mock-stat-divider"></div>
        <div className="mock-stat-item">
          <span className="stat-num">120 Min</span>
          <span className="stat-lbl">Exam Timer</span>
        </div>
        <div className="mock-stat-divider"></div>
        <div className="mock-stat-item">
          <span className="stat-num">180</span>
          <span className="stat-lbl">Questions</span>
        </div>
      </div>
    </div>
  </div>
);

/**
 * Screen 2 Graphic: Topic-Based Practice Visual Composition
 */
export const GraphicPractice = () => (
  <div className="graphic-container practice-graphic">
    <div className="mock-card question-mock">
      <div className="mock-question-tag"><Layers size={13} /> Physics • Work, Energy & Power</div>
      <div className="mock-question-body">
        Calculate the kinetic energy of a 2 kg object moving at a constant speed of 10 m/s.
      </div>
      <div className="mock-options">
        <div className="mock-option">A. 50 Joules</div>
        <div className="mock-option selected-correct">
          <span>B. 100 Joules</span>
          <CheckCircle2 size={15} className="check-icon" />
        </div>
        <div className="mock-option">C. 200 Joules</div>
      </div>
      <div className="mock-explanation-box">
        <span className="explanation-title">Step-by-Step Solution</span>
        <span className="explanation-text">Kinetic Energy (KE) = ½ × m × v² = ½ × 2 kg × (10 m/s)² = 100 J.</span>
      </div>
    </div>
  </div>
);

/**
 * Screen 3 Graphic: CBT Exam Simulation Visual Composition
 */
export const GraphicCBT = () => (
  <div className="graphic-container cbt-graphic">
    <div className="mock-card cbt-mock">
      <div className="mock-cbt-topbar">
        <span className="cbt-status-dot"></span>
        <span className="cbt-exam-name">UTME CBT SIMULATOR</span>
        <span className="cbt-timer-badge"><Clock size={12} /> 01:59:00</span>
      </div>
      <div className="mock-subject-tabs">
        <span className="tab-pill active">Use of English (60)</span>
        <span className="tab-pill">Mathematics (40)</span>
        <span className="tab-pill">Physics (40)</span>
        <span className="tab-pill">Chemistry (40)</span>
      </div>
      <div className="mock-palette-label">Question Palette Navigation</div>
      <div className="mock-palette-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
          <span
            key={num}
            className={`palette-num ${num <= 4 ? 'answered' : num === 5 ? 'current' : 'unanswered'}`}
          >
            {num}
          </span>
        ))}
      </div>
    </div>
  </div>
);

/**
 * Screen 4 Graphic: Performance Tracking Visual Composition
 */
export const GraphicAnalytics = () => (
  <div className="graphic-container analytics-graphic">
    <div className="mock-card analytics-mock">
      <div className="mock-analytics-header">
        <div>
          <span className="analytics-subtitle">Target UTME Goal</span>
          <div className="score-display">320 <span className="max-score">/ 400</span></div>
        </div>
        <span className="target-pill"><BarChart3 size={13} /> Performance Hub</span>
      </div>
      <div className="mock-subject-bars">
        <div className="bar-row">
          <span className="bar-label">English</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: '85%' }}></div></div>
          <span className="bar-val">85%</span>
        </div>
        <div className="bar-row">
          <span className="bar-label">Maths</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: '75%' }}></div></div>
          <span className="bar-val">75%</span>
        </div>
        <div className="bar-row">
          <span className="bar-label">Physics</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: '80%' }}></div></div>
          <span className="bar-val">80%</span>
        </div>
      </div>
    </div>
  </div>
);
