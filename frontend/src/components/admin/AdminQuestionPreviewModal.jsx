import React from 'react';
import { X, CheckCircle2, BookOpen, Layers, HelpCircle, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card/Card';
import { Button } from '../common/Button/Button';
import { Badge } from '../common/Badge/Badge';
import './AdminQuestionPreviewModal.css';

export function AdminQuestionPreviewModal({ question, onClose, subjects = [] }) {
  if (!question) return null;

  const subjectObj = subjects.find(s => s.id === question.subject_id) || question.subject || { name: 'Subject', code: 'UTME' };

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <div className="preview-modal-title">
            <Badge variant="lime">{subjectObj.code || 'UTME'}</Badge>
            <h3>Question #{question.id || 'New'} Candidate View</h3>
          </div>
          <button className="preview-close-btn" onClick={onClose} aria-label="Close preview">
            <X size={18} />
          </button>
        </div>

        <div className="preview-modal-body">
          <div className="preview-meta-bar">
            <span><strong>Subject:</strong> {subjectObj.name || subjectObj.code}</span>
            {question.subtopic && <span><strong>Subtopic:</strong> {question.subtopic}</span>}
            {question.difficulty && <span><strong>Difficulty:</strong> {question.difficulty}</span>}
            {question.year && <span><strong>Year:</strong> {question.year}</span>}
            <Badge variant={question.status === 'Published' ? 'emerald' : 'amber'}>
              {question.status}
            </Badge>
          </div>

          {question.passage && (
            <div className="preview-passage-box">
              <h5 className="preview-section-heading"><BookOpen size={14} /> Passage</h5>
              <p className="preview-passage-text">{question.passage}</p>
            </div>
          )}

          <div className="preview-question-card">
            <h4 className="preview-question-text">{question.question_text}</h4>

            <div className="preview-options-list">
              {['A', 'B', 'C', 'D'].map((optKey) => {
                const optText = question.options?.[optKey] || '';
                const isCorrect = question.correct_option === optKey;

                return (
                  <div
                    key={optKey}
                    className={`preview-option-item ${isCorrect ? 'is-correct' : ''}`}
                  >
                    <span className="preview-option-key">{optKey}.</span>
                    <span className="preview-option-val">{optText}</span>
                    {isCorrect && (
                      <span className="preview-correct-badge">
                        <CheckCircle2 size={14} /> Correct Answer
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {question.explanation && (
            <div className="preview-explanation-box">
              <h5 className="preview-section-heading"><HelpCircle size={14} /> Official Solution & Working</h5>
              <p className="preview-explanation-text">{question.explanation}</p>
            </div>
          )}
        </div>

        <div className="preview-modal-footer">
          <Button variant="outline" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
