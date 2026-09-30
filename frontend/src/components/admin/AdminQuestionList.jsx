import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Eye, Trash2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Layers, RefreshCw } from 'lucide-react';
import { Card } from '../common/Card/Card';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { apiRequest } from '../../services/apiClient';
import { AdminQuestionPreviewModal } from './AdminQuestionPreviewModal';
import './AdminQuestionList.css';

export function AdminQuestionList({ subjects = [], onAddNew, onEditQuestion }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals & Messages
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [page, selectedSubject, selectedDifficulty, selectedStatus]);

  const fetchQuestions = async (searchOverride = null) => {
    setLoading(true);
    setFeedbackMsg(null);

    try {
      const userObj = JSON.parse(localStorage.getItem('utme_user') || '{}');
      const token = userObj.token || userObj.access_token || '';

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (selectedSubject) queryParams.append('subject_id', selectedSubject);
      if (selectedDifficulty) queryParams.append('difficulty', selectedDifficulty);
      if (selectedStatus) queryParams.append('status', selectedStatus);

      const activeSearch = searchOverride !== null ? searchOverride : search;
      if (activeSearch.trim()) queryParams.append('search', activeSearch.trim());

      const data = await apiRequest(`/api/v1/admin/questions?${queryParams.toString()}`, { headers });

      if (data && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setTotalQuestions(data.total || 0);
        setTotalPages(data.total_pages || 1);
      }
    } catch (err) {
      console.error("Error fetching admin questions:", err);
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to load question bank." });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions(search);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSubject('');
    setSelectedDifficulty('');
    setSelectedStatus('');
    setPage(1);
    fetchQuestions('');
  };

  const handleToggleStatus = async (q) => {
    const newStatus = q.status === 'Published' ? 'Draft' : 'Published';
    try {
      const userObj = JSON.parse(localStorage.getItem('utme_user') || '{}');
      const token = userObj.token || userObj.access_token || '';
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      await apiRequest(`/api/v1/admin/questions/${q.id}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers,
      });

      setQuestions(prev => prev.map(item => item.id === q.id ? { ...item, status: newStatus } : item));
      setFeedbackMsg({ type: 'success', text: `Question #${q.id} status updated to ${newStatus}.` });
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Failed to update status." });
    }
  };

  const handleDelete = async (qId) => {
    setDeletingId(qId);
    try {
      const userObj = JSON.parse(localStorage.getItem('utme_user') || '{}');
      const token = userObj.token || userObj.access_token || '';
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      await apiRequest(`/api/v1/admin/questions/${qId}`, {
        method: 'DELETE',
        headers,
      });

      setFeedbackMsg({ type: 'success', text: `Question #${qId} deleted successfully.` });
      setConfirmDeleteId(null);
      fetchQuestions();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || "Failed to delete question." });
    } finally {
      setDeletingId(null);
    }
  };

  const getSubjectCode = (subjId, subjObj) => {
    if (subjObj?.code) return subjObj.code;
    const found = subjects.find(s => s.id === subjId);
    return found ? found.code : `SUBJ #${subjId}`;
  };

  return (
    <div className="admin-bank-container">
      {/* Top Header & Quick Add */}
      <div className="admin-bank-header">
        <div className="admin-bank-title-group">
          <h2>Question Bank</h2>
          <span className="admin-count-pill">{totalQuestions} Questions</span>
        </div>

        <Button variant="accent" onClick={onAddNew} leftIcon={<Plus size={16} />}>
          Add New Question
        </Button>
      </div>

      {feedbackMsg && (
        <div className={`admin-banner ${feedbackMsg.type === 'error' ? 'error-banner' : 'success-banner'}`}>
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <Card variant="default" className="admin-toolbar-card">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search question text or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="filter-group">
          <select
            value={selectedSubject}
            onChange={(e) => { setSelectedSubject(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => { setSelectedDifficulty(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>

          {(search || selectedSubject || selectedDifficulty || selectedStatus) && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters} leftIcon={<RefreshCw size={14} />}>
              Reset
            </Button>
          )}
        </div>
      </Card>

      {/* Question Table (Desktop) / Question Cards (Mobile) */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading question bank...</p>
        </div>
      ) : questions.length === 0 ? (
        <Card variant="bordered" className="empty-bank-card">
          <Layers size={36} color="var(--text-muted)" />
          <h3>No Questions Found</h3>
          <p>No questions match your filter criteria or question bank is empty.</p>
          <Button variant="accent" size="sm" onClick={onAddNew} style={{ marginTop: '12px' }}>
            Create First Question
          </Button>
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="table-responsive-wrapper">
            <table className="admin-questions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subject</th>
                  <th>Question Preview</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id}>
                    <td className="cell-id">#{q.id}</td>
                    <td>
                      <Badge variant="indigo" size="sm">
                        {getSubjectCode(q.subject_id, q.subject)}
                      </Badge>
                    </td>
                    <td className="cell-text">
                      <div className="question-text-truncate">{q.question_text}</div>
                      {q.subtopic && <span className="subtopic-tag">{q.subtopic}</span>}
                    </td>
                    <td>
                      <Badge
                        variant={q.difficulty === 'Easy' ? 'emerald' : q.difficulty === 'Hard' ? 'coral' : 'amber'}
                        size="sm"
                      >
                        {q.difficulty || 'Medium'}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className={`status-toggle-btn ${q.status === 'Published' ? 'is-published' : 'is-draft'}`}
                        onClick={() => handleToggleStatus(q)}
                        title="Click to toggle Draft / Published"
                      >
                        {q.status === 'Published' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span>{q.status}</span>
                      </button>
                    </td>
                    <td className="cell-actions">
                      <div className="action-buttons-row">
                        <button
                          className="icon-action-btn"
                          title="Preview Candidate View"
                          onClick={() => setPreviewQuestion(q)}
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="icon-action-btn"
                          title="Edit Question"
                          onClick={() => onEditQuestion(q)}
                        >
                          <Edit2 size={16} />
                        </button>

                        <button
                          className="icon-action-btn danger"
                          title="Delete Question"
                          onClick={() => setConfirmDeleteId(q.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards Layout */}
          <div className="mobile-questions-list">
            {questions.map((q) => (
              <Card key={q.id} variant="default" className="mobile-question-card">
                <div className="mobile-card-top">
                  <span className="mobile-id">#{q.id}</span>
                  <Badge variant="indigo" size="sm">{getSubjectCode(q.subject_id, q.subject)}</Badge>
                  <button
                    className={`status-toggle-btn ${q.status === 'Published' ? 'is-published' : 'is-draft'}`}
                    onClick={() => handleToggleStatus(q)}
                  >
                    <span>{q.status}</span>
                  </button>
                </div>

                <p className="mobile-question-text">{q.question_text}</p>

                <div className="mobile-card-actions">
                  <Button variant="outline" size="sm" onClick={() => setPreviewQuestion(q)} leftIcon={<Eye size={14} />}>
                    Preview
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onEditQuestion(q)} leftIcon={<Edit2 size={14} />}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(q.id)} style={{ color: 'var(--color-coral)' }}>
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Bar */}
          <div className="pagination-bar">
            <span className="pagination-info">
              Showing page {page} of {totalPages} ({totalQuestions} items)
            </span>

            <div className="pagination-controls">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                leftIcon={<ChevronLeft size={16} />}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                rightIcon={<ChevronRight size={16} />}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="modal-overlay">
          <Card variant="bordered" className="confirm-delete-modal">
            <h4>Confirm Question Deletion</h4>
            <p>Are you sure you want to delete Question #{confirmDeleteId}? This action cannot be undone.</p>
            <div className="confirm-modal-actions">
              <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                style={{ backgroundColor: 'var(--color-coral)', borderColor: 'var(--color-coral)' }}
                disabled={deletingId === confirmDeleteId}
                onClick={() => handleDelete(confirmDeleteId)}
              >
                Confirm Delete
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {previewQuestion && (
        <AdminQuestionPreviewModal
          question={previewQuestion}
          subjects={subjects}
          onClose={() => setPreviewQuestion(null)}
        />
      )}
    </div>
  );
}
