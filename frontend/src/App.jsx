import React, { useState } from 'react';
import { BookOpen, Timer, BarChart3, ShieldCheck, Play, Layers, CheckCircle2 } from 'lucide-react';
import { Header } from './components/common/Header/Header';
import { BottomNav } from './components/common/Navigation/BottomNav';
import { Card } from './components/common/Card/Card';
import { Button } from './components/common/Button/Button';
import { Badge } from './components/common/Badge/Badge';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { SettingsView } from './components/settings/SettingsView';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function MainAppShell() {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('utme_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('utme_onboarded');
  });

  const handleFinishOnboarding = (userData) => {
    localStorage.setItem('utme_onboarded', 'true');
    if (userData && userData.email) {
      localStorage.setItem('utme_user', JSON.stringify(userData));
      setUser(userData);
    }
    setShowOnboarding(false);
  };

  const handleUpdateUser = (updatedData) => {
    setUser(updatedData);
    localStorage.setItem('utme_user', JSON.stringify(updatedData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('utme_user');
  };

  const handleReplayOnboarding = () => {
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return <OnboardingFlow onFinishOnboarding={handleFinishOnboarding} />;
  }

  return (
    <div className="app-shell">
      <Header
        user={user}
        onReplayTour={handleReplayOnboarding}
        onLogout={handleLogout}
        onOpenAuth={() => setShowOnboarding(true)}
      />

      <div className="app-shell-body">
        <main className="main-content">
          {activeTab === 'home' && (
            <div className="tab-view">
              <Card variant="dark" className="hero-dashboard-card">
                <div className="hero-top-badge">
                  <Badge variant="lime" size="sm">2026 UTME ENGINE</Badge>
                </div>
                <h1 className="hero-dashboard-title">UTME CBT Examination & Topic Practice</h1>
                <p className="hero-dashboard-desc">
                  Prepare with official UTME format timed simulations, topic-by-topic study modules, and step-by-step solution explanations.
                </p>
                <div className="hero-dashboard-actions">
                  <Button
                    variant="accent"
                    size="lg"
                    onClick={() => setActiveTab('cbt')}
                    leftIcon={<Timer size={18} />}
                  >
                    Launch Full CBT Exam
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    style={{ color: 'var(--color-white)', borderColor: 'var(--border-subtle)' }}
                    onClick={() => setActiveTab('practice')}
                    leftIcon={<BookOpen size={18} />}
                  >
                    Practice by Topic
                  </Button>
                </div>
              </Card>

              <div className="section-header">
                <h3>UTME Subject Catalog</h3>
                <span className="section-badge">4 Core Subjects</span>
              </div>

              <div className="subject-responsive-grid">
                {[
                  { code: 'ENG', name: 'Use of English', format: '60 Questions • 40 Mins', variant: 'indigo' },
                  { code: 'MTH', name: 'Mathematics', format: '40 Questions • 30 Mins', variant: 'amber' },
                  { code: 'PHY', name: 'Physics', format: '40 Questions • 30 Mins', variant: 'emerald' },
                  { code: 'CHM', name: 'Chemistry', format: '40 Questions • 30 Mins', variant: 'coral' },
                ].map((sub) => (
                  <Card key={sub.code} interactive variant="default" className="subject-catalog-card">
                    <div className="subject-card-top">
                      <Badge variant={sub.variant}>{sub.code}</Badge>
                      <span className="subject-format">{sub.format}</span>
                    </div>
                    <h4 className="subject-title-text">{sub.name}</h4>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'practice' && (
            <div className="tab-view">
              <h2>Topic-Based Practice Engine</h2>
              <p className="subtext">Select a subject topic to start instant answer practice with detailed solutions.</p>
              <Card variant="bordered">
                <Badge variant="indigo" icon={<Layers size={13} />}>Topic Practice</Badge>
                <h4 style={{ marginTop: '14px' }}>Study Features:</h4>
                <ul className="feature-list-clean">
                  <li><CheckCircle2 size={16} color="var(--color-emerald)" /> Instant answer verification per question</li>
                  <li><CheckCircle2 size={16} color="var(--color-emerald)" /> Detailed step-by-step working & formulas</li>
                  <li><CheckCircle2 size={16} color="var(--color-emerald)" /> Filter by subject and topic area</li>
                </ul>
                <Button variant="accent" fullWidth style={{ marginTop: '20px' }}>
                  Select Topic & Begin Practice
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'cbt' && (
            <div className="tab-view">
              <h2>4-Subject UTME Simulation Engine</h2>
              <p className="subtext">Official exam environment: 180 questions with 120-minute timer.</p>
              <Card variant="dark">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge variant="lime" icon={<Timer size={13} />}>EXAM MODE</Badge>
                  <span style={{ fontSize: '13px', color: 'var(--color-electric-lime)', fontFamily: 'var(--font-heading)', fontWeight: '700' }}>
                    120 Minutes
                  </span>
                </div>
                <h3 style={{ marginTop: '14px', color: '#FFF' }}>Full UTME CBT Exam</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px', lineHeight: '1.5' }}>
                  Simulates official test layouts with question palette navigation, answer flagging, subject switching, and instant scoring.
                </p>
                <Button variant="accent" size="lg" fullWidth style={{ marginTop: '20px' }} leftIcon={<Play size={18} />}>
                  Start Timed Exam
                </Button>
              </Card>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="tab-view">
              <h2>Performance Analytics</h2>
              <p className="subtext">Track accuracy, response speed, and topic performance.</p>
              <div className="analytics-grid">
                <Card variant="default">
                  <h4>Target UTME Score</h4>
                  <div style={{ fontSize: '32px', fontFamily: 'var(--font-heading)', fontWeight: '800', color: 'var(--color-electric-lime)', marginTop: '8px' }}>
                    {user?.targetScore || 320} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ 400</span>
                  </div>
                </Card>
                <Card variant="default">
                  <h4>Average Speed</h4>
                  <div style={{ fontSize: '32px', fontFamily: 'var(--font-heading)', fontWeight: '800', color: 'var(--color-emerald)', marginTop: '8px' }}>
                    42s <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ question</span>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <SettingsView
              user={user}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
              onReplayTour={handleReplayOnboarding}
            />
          )}
        </main>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainAppShell />
    </AuthProvider>
  );
}
