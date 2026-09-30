import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, PlusCircle, CheckCircle2, FileText, Layers, TrendingUp, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card } from '../common/Card/Card';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { apiRequest } from '../../services/apiClient';
import { AdminQuestionList } from './AdminQuestionList';
import { AdminQuestionForm } from './AdminQuestionForm';
import './AdminDashboard.css';

export function AdminDashboard({ user }) {
  const [activeAdminTab, setActiveAdminTab] = useState('overview'); // 'overview' | 'bank' | 'add' | 'subjects'
  const [stats, setStats] = useState({
    total_questions: 0,
    published_questions: 0,
    draft_questions: 0,
    total_subjects: 0,
    recent_activity: []
  });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const userObj = JSON.parse(localStorage.getItem('utme_user') || '{}');
      const token = userObj.token || userObj.access_token || '';

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const [statsRes, subjRes] = await Promise.all([
        apiRequest('/api/v1/admin/questions/stats', { headers }).catch(() => null),
        apiRequest('/api/v1/subjects', { headers }).catch(() => [])
      ]);

      if (statsRes) {
        setStats(statsRes);
      }
      if (Array.isArray(subjRes)) {
        setSubjects(subjRes);
      }
    } catch (err) {
      console.warn("Admin data load:", err);
      setErrorMsg("Unable to fetch live admin stats. Check admin authorization.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (questionObj) => {
    setEditingQuestion(questionObj);
    setActiveAdminTab('add');
  };

  const handleAddNew = () => {
    setEditingQuestion(null);
    setActiveAdminTab('add');
  };

  const handleFormSaved = () => {
    fetchAdminData();
    setEditingQuestion(null);
    setActiveAdminTab('bank');
  };

  return (
    <div className="admin-portal-wrapper">
      {/* Admin Sub-Header Navigation */}
      <div className="admin-subhead-bar">
        <div className="admin-portal-brand">
          <ShieldCheck size={20} color="var(--color-electric-lime)" />
          <span>UTME ADMIN CONTROL PANEL</span>
        </div>

        <nav className="admin-nav-pills" aria-label="Admin navigation">
          <button
            className={`admin-nav-pill ${activeAdminTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('overview')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </button>

          <button
            className={`admin-nav-pill ${activeAdminTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('bank')}
          >
            <BookOpen size={16} />
            <span>Question Bank</span>
          </button>

          <button
            className={`admin-nav-pill ${activeAdminTab === 'add' ? 'active' : ''}`}
            onClick={handleAddNew}
          >
            <PlusCircle size={16} />
            <span>{editingQuestion ? 'Edit Question' : 'Add Question'}</span>
          </button>
        </nav>
      </div>

      {errorMsg && (
        <div className="admin-banner error-banner" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* View 1: Overview Dashboard */}
      {activeAdminTab === 'overview' && (
        <div className="admin-tab-view">
          <div className="admin-welcome-card">
            <div>
              <Badge variant="lime">ADMINISTRATION</Badge>
              <h2 className="admin-welcome-title">Question Bank & Curriculum Control</h2>
              <p className="admin-welcome-desc">
                Manage UTME exam question pools, publish validated items, review draft submissions, and inspect subject coverage.
              </p>
            </div>

            <div className="admin-quick-actions">
              <Button variant="accent" size="sm" onClick={handleAddNew} leftIcon={<PlusCircle size={16} />}>
                Create Question
              </Button>
              <Button variant="outline" size="sm" onClick={() => setActiveAdminTab('bank')} leftIcon={<BookOpen size={16} />}>
                Manage Question Bank
              </Button>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="admin-stats-grid">
            <Card variant="default" className="stat-card">
              <div className="stat-icon-wrapper indigo">
                <BookOpen size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Questions</span>
                <span className="stat-value">{stats.total_questions}</span>
              </div>
            </Card>

            <Card variant="default" className="stat-card">
              <div className="stat-icon-wrapper lime">
                <CheckCircle2 size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Published (Active)</span>
                <span className="stat-value">{stats.published_questions}</span>
              </div>
            </Card>

            <Card variant="default" className="stat-card">
              <div className="stat-icon-wrapper amber">
                <FileText size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Drafts (In Review)</span>
                <span className="stat-value">{stats.draft_questions}</span>
              </div>
            </Card>

            <Card variant="default" className="stat-card">
              <div className="stat-icon-wrapper emerald">
                <Layers size={22} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Active UTME Subjects</span>
                <span className="stat-value">{stats.total_subjects || subjects.length}</span>
              </div>
            </Card>
          </div>

          {/* Recent Activity & Quick Subject Overview */}
          <div className="admin-two-column-layout">
            <Card variant="bordered" className="admin-activity-card">
              <div className="activity-card-header">
                <h3>Recent Question Activity</h3>
                <Button variant="ghost" size="sm" onClick={fetchAdminData} leftIcon={<RefreshCw size={14} />}>
                  Refresh
                </Button>
              </div>

              {stats.recent_activity && stats.recent_activity.length > 0 ? (
                <div className="activity-feed">
                  {stats.recent_activity.map((item, idx) => (
                    <div key={item.id || idx} className="activity-item">
                      <div className="activity-badge-group">
                        <Badge variant="indigo" size="sm">{item.subject_code}</Badge>
                        <Badge variant={item.status === 'Published' ? 'emerald' : 'amber'} size="sm">
                          {item.status}
                        </Badge>
                      </div>
                      <p className="activity-text">{item.text}</p>
                      <span className="activity-time">{item.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-activity-text">No recent activity recorded yet. Create or edit questions to see updates here.</p>
              )}
            </Card>

            <Card variant="default" className="admin-subjects-summary-card">
              <h3>UTME Subjects Overview</h3>
              <p className="subtext">Available subjects registered in persistent database:</p>

              <div className="subjects-mini-list">
                {subjects.map((sub) => (
                  <div key={sub.id} className="subject-mini-item">
                    <div className="subject-mini-left">
                      <span className="subject-code-tag">{sub.code}</span>
                      <span className="subject-name">{sub.name}</span>
                    </div>
                    <span className="subject-q-count">{sub.question_count || 0} Published Qs</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* View 2: Question Bank List */}
      {activeAdminTab === 'bank' && (
        <AdminQuestionList
          subjects={subjects}
          onAddNew={handleAddNew}
          onEditQuestion={handleEditQuestion}
        />
      )}

      {/* View 3: Add / Edit Question Form */}
      {activeAdminTab === 'add' && (
        <AdminQuestionForm
          initialData={editingQuestion}
          subjects={subjects}
          onSaved={handleFormSaved}
          onCancel={() => setActiveAdminTab('bank')}
        />
      )}
    </div>
  );
}
