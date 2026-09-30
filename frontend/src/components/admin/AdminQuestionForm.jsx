import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle, ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Card } from '../common/Card/Card';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import { apiRequest } from '../../services/apiClient';
import './AdminQuestionForm.css';

export function AdminQuestionForm({ initialData = null, onSaved, onCancel, subjects = [] }) {
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    subject_id: initialData?.subject_id || (subjects[0]?.id || 1),
    topic_id: initialData?.topic_id || '',
    subtopic: initialData?.subtopic || '',
    year: initialData?.year || '',
    source: initialData?.source || '',
    passage: initialData?.passage || '',
    question_text: initialData?.question_text || '',
    image_url: initialData?.image_url || '',
    options: {
      A: initialData?.options?.A || '',
      B: initialData?.options?.B || '',
      C: initialData?.options?.C || '',
      D: initialData?.options?.D || '',
    },
    correct_option: initialData?.correct_option || 'A',
    explanation: initialData?.explanation || '',
    difficulty: initialData?.difficulty || 'Medium',
    status: initialData?.status || 'Draft',
  });

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Load topics when selected subject changes
  useEffect(() => {
    if (formData.subject_id) {
      const selectedSubj = subjects.find(s => s.id === Number(formData.subject_id));
      if (selectedSubj && selectedSubj.topics) {
        setTopics(selectedSubj.topics);
      } else {
        fetchTopicsForSubject(formData.subject_id);
      }
    }
  }, [formData.subject_id, subjects]);

  const fetchTopicsForSubject = async (subjId) => {
    try {
      const data = await apiRequest(`/api/v1/subjects/${subjId}/topics`);
      if (Array.isArray(data)) {
        setTopics(data);
      }
    } catch (e) {
      console.warn("Topics fetch fallback:", e);
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg(null);
  };

  const handleOptionChange = (optionKey, value) => {
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [optionKey]: value,
      },
    }));
    setErrorMsg(null);
  };

  const handleSubmit = async (e, forceStatus = null) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!formData.question_text.trim() || formData.question_text.trim().length < 5) {
      setErrorMsg("Question text is required and must be at least 5 characters.");
      return;
    }

    if (!formData.options.A.trim() || !formData.options.B.trim() || !formData.options.C.trim() || !formData.options.D.trim()) {
      setErrorMsg("All four options (A, B, C, D) must contain answer text.");
      return;
    }

    if (!['A', 'B', 'C', 'D'].includes(formData.correct_option)) {
      setErrorMsg("Please select a valid correct option (A, B, C, or D).");
      return;
    }

    const submitStatus = forceStatus || formData.status;

    const payload = {
      subject_id: Number(formData.subject_id),
      topic_id: formData.topic_id ? Number(formData.topic_id) : null,
      subtopic: formData.subtopic.trim() || null,
      year: formData.year ? Number(formData.year) : null,
      source: formData.source.trim() || null,
      passage: formData.passage.trim() || null,
      question_text: formData.question_text.trim(),
      image_url: formData.image_url.trim() || null,
      options: {
        A: formData.options.A.trim(),
        B: formData.options.B.trim(),
        C: formData.options.C.trim(),
        D: formData.options.D.trim(),
      },
      correct_option: formData.correct_option,
      explanation: formData.explanation.trim() || null,
      difficulty: formData.difficulty,
      status: submitStatus,
    };

    setLoading(true);

    try {
      const userObj = JSON.parse(localStorage.getItem('utme_user') || '{}');
      const token = userObj.token || userObj.access_token || '';

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let response;
      if (isEditing) {
        response = await apiRequest(`/api/v1/admin/questions/${initialData.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
        setSuccessMsg(`Question #${initialData.id} updated successfully.`);
      } else {
        response = await apiRequest('/api/v1/admin/questions', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        setSuccessMsg(`Question created successfully as ${submitStatus}.`);
      }

      if (onSaved) {
        setTimeout(() => {
          onSaved(response);
        }, 600);
      }
    } catch (err) {
      if (err.status === 409) {
        setErrorMsg("Duplicate Question Error: An identical question already exists in this subject.");
      } else {
        setErrorMsg(err.message || "Failed to save question. Please check backend authorization.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <div className="admin-form-header">
        <div className="admin-form-title-group">
          <Button variant="ghost" size="sm" onClick={onCancel} leftIcon={<ArrowLeft size={16} />}>
            Back
          </Button>
          <h2>{isEditing ? `Edit Question #${initialData.id}` : 'Create New Question'}</h2>
        </div>
        <Badge variant={formData.status === 'Published' ? 'lime' : 'amber'}>
          {formData.status}
        </Badge>
      </div>

      {errorMsg && (
        <div className="admin-banner error-banner">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="admin-banner success-banner">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e)} className="admin-question-form">
        <div className="form-grid-2col">
          <div className="form-group">
            <label htmlFor="subject_id">Subject <span className="required-star">*</span></label>
            <select
              id="subject_id"
              name="subject_id"
              value={formData.subject_id}
              onChange={handleTextChange}
              className="form-control"
              required
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="topic_id">Topic (Optional)</label>
            <select
              id="topic_id"
              name="topic_id"
              value={formData.topic_id}
              onChange={handleTextChange}
              className="form-control"
            >
              <option value="">-- Select Topic --</option>
              {topics.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subtopic">Subtopic (Optional)</label>
            <input
              type="text"
              id="subtopic"
              name="subtopic"
              value={formData.subtopic}
              onChange={handleTextChange}
              placeholder="e.g. Synonyms & Antonyms"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty Level</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleTextChange}
              className="form-control"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="year">UTME Exam Year (Optional)</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleTextChange}
              placeholder="e.g. 2024"
              min="1978"
              max="2030"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="source">Source / Reference (Optional)</label>
            <input
              type="text"
              id="source"
              name="source"
              value={formData.source}
              onChange={handleTextChange}
              placeholder="e.g. JAMB Official Past Questions"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="passage">Comprehension Passage (Optional)</label>
          <textarea
            id="passage"
            name="passage"
            rows="3"
            value={formData.passage}
            onChange={handleTextChange}
            placeholder="For Use of English or Literature comprehension passages..."
            className="form-control textarea"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="question_text">Question Text <span className="required-star">*</span></label>
          <textarea
            id="question_text"
            name="question_text"
            rows="4"
            value={formData.question_text}
            onChange={handleTextChange}
            placeholder="Type the question text clearly..."
            className="form-control textarea"
            required
          />
        </div>

        <div className="options-section">
          <h4 className="options-section-title">Answer Options (MCQ)</h4>
          <p className="options-section-desc">Enter four choices and select the single correct option.</p>

          <div className="options-grid">
            {['A', 'B', 'C', 'D'].map((optKey) => (
              <div key={optKey} className={`option-card ${formData.correct_option === optKey ? 'is-correct' : ''}`}>
                <div className="option-card-header">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="correct_option"
                      value={optKey}
                      checked={formData.correct_option === optKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, correct_option: e.target.value }))}
                    />
                    <span className="option-badge">Option {optKey}</span>
                  </label>
                  {formData.correct_option === optKey && (
                    <span className="correct-tag">Correct Answer</span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.options[optKey]}
                  onChange={(e) => handleOptionChange(optKey, e.target.value)}
                  placeholder={`Option ${optKey} text...`}
                  className="form-control"
                  required
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-group full-width" style={{ marginTop: '20px' }}>
          <label htmlFor="explanation">Step-by-Step Explanation</label>
          <textarea
            id="explanation"
            name="explanation"
            rows="3"
            value={formData.explanation}
            onChange={handleTextChange}
            placeholder="Provide clear rationale, working steps, or formulas for candidates..."
            className="form-control textarea"
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Publication Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleTextChange}
            className="form-control"
          >
            <option value="Draft">Draft (Saved internally, hidden from candidates)</option>
            <option value="Published">Published (Active in CBT exam engine)</option>
          </select>
        </div>

        <div className="form-actions">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={(e) => handleSubmit(e, 'Draft')}
            leftIcon={<Save size={16} />}
          >
            Save as Draft
          </Button>

          <Button
            type="submit"
            variant="accent"
            disabled={loading}
            onClick={(e) => handleSubmit(e, 'Published')}
            leftIcon={<Send size={16} />}
          >
            {isEditing ? 'Update Question' : 'Publish Question'}
          </Button>
        </div>
      </form>
    </div>
  );
}
