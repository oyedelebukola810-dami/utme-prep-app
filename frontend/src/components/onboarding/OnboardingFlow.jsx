import React, { useState } from 'react';
import { SplashScreen } from './SplashScreen';
import { GraphicWelcome, GraphicPractice, GraphicCBT, GraphicAnalytics } from './OnboardingGraphics';
import { AuthEntryScreen } from './AuthEntryScreen';
import { Button } from '../common/Button/Button';
import './OnboardingFlow.css';

const SLIDES = [
  {
    id: 1,
    tag: 'WELCOME',
    title: 'Next-Gen 2026 UTME Prep',
    description: 'Built specifically for Nigerian candidates aiming for 300+ in JAMB UTME with verified past questions and authentic CBT engine.',
    graphic: <GraphicWelcome />
  },
  {
    id: 2,
    tag: 'PRACTICE',
    title: 'Master Topics Step-by-Step',
    description: 'Practice by subject topics with instant answer verification and crystal-clear step-by-step solution breakdowns.',
    graphic: <GraphicPractice />
  },
  {
    id: 3,
    tag: 'CBT SIMULATION',
    title: 'Real JAMB CBT Environment',
    description: 'Simulate full 4-subject UTME exams with 120-minute timer, question palette grid, flagging, and instant score calculation.',
    graphic: <GraphicCBT />
  },
  {
    id: 4,
    tag: 'ANALYTICS',
    title: 'Track Speed & Accuracy',
    description: 'Identify weak subjects before exam day, monitor time spent per question, and watch your projected score climb.',
    graphic: <GraphicAnalytics />
  }
];

export const OnboardingFlow = ({ onFinishOnboarding }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showAuthEntry, setShowAuthEntry] = useState(false);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showAuthEntry) {
    return (
      <AuthEntryScreen
        onCompleteGuest={(userData) => onFinishOnboarding(userData)}
      />
    );
  }

  const currentSlide = SLIDES[currentSlideIndex];
  const isLastSlide = currentSlideIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      setShowAuthEntry(true);
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setShowAuthEntry(true);
  };

  return (
    <div className="onboarding-flow-container">
      {/* Top Bar with Progress Tag & Skip Button */}
      <div className="onboarding-topbar">
        <span className="onboarding-step-tag">
          {currentSlide.tag} • {currentSlideIndex + 1}/{SLIDES.length}
        </span>
        <button type="button" className="skip-btn" onClick={handleSkip}>
          Skip
        </button>
      </div>

      {/* Slide Visual Graphic */}
      <div className="onboarding-visual-area">
        {currentSlide.graphic}
      </div>

      {/* Slide Text Content */}
      <div className="onboarding-text-area">
        <h2 className="onboarding-title">{currentSlide.title}</h2>
        <p className="onboarding-description">{currentSlide.description}</p>
      </div>

      {/* Footer Navigation Bar */}
      <div className="onboarding-footer">
        <div className="progress-dots">
          {SLIDES.map((_, idx) => (
            <span
              key={idx}
              className={`dot ${idx === currentSlideIndex ? 'active' : ''}`}
            />
          ))}
        </div>

        <Button
          variant="accent"
          size="lg"
          fullWidth
          onClick={handleNext}
        >
          {isLastSlide ? 'Get Started' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
