import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Phone, User, Clock, FileText, MessageSquare } from 'lucide-react';
import './CallDisposition.css';

const CallDisposition = ({ callData, onSubmit, onCancel }) => {
  const [selectedDisposition, setSelectedDisposition] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Standard Vicidial Dispositions
  const dispositions = [
    { value: 'SALE', label: 'Sale', color: '#00ff88' },
    { value: 'CALLBACK', label: 'Callback', color: '#4ECDC4' },
    { value: 'NO SALE', label: 'No Sale', color: '#ff6b6b' },
    { value: 'NOT INTERESTED', label: 'Not Interested', color: '#ff8787' },
    { value: 'NO ANSWER', label: 'No Answer', color: '#ffa726' },
    { value: 'ANSWERING MACHINE', label: 'Answering Machine', color: '#ffb74d' },
    { value: 'BUSY', label: 'Busy', color: '#ff9800' },
    { value: 'DISCONNECTED', label: 'Disconnected Number', color: '#f44336' },
    { value: 'DO NOT CALL', label: 'Do Not Call', color: '#d32f2f' },
    { value: 'WRONG NUMBER', label: 'Wrong Number', color: '#e91e63' },
    { value: 'FOLLOW UP', label: 'Follow Up', color: '#9c27b0' },
    { value: 'OTHER', label: 'Other', color: '#757575' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDisposition) {
      alert('Please select a call disposition');
      return;
    }

    if (!callNotes.trim()) {
      alert('Please enter call notes');
      return;
    }

    setIsSubmitting(true);

    const dispositionData = {
      ...callData,
      disposition: selectedDisposition,
      callNotes: callNotes.trim(),
      submittedAt: new Date().toISOString(),
    };

    await onSubmit(dispositionData);
    setIsSubmitting(false);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="call-disposition-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="call-disposition-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="disposition-header">
          <h2 className="disposition-title">Call Disposition</h2>
          <p className="disposition-subtitle">Complete call details and submit</p>
        </div>

        <div className="call-info-section">
          <div className="call-info-grid">
            <div className="call-info-item">
              <Phone size={16} className="info-icon" />
              <div>
                <div className="info-label">Phone Number</div>
                <div className="info-value">{callData?.phoneNumber || 'N/A'}</div>
              </div>
            </div>
            <div className="call-info-item">
              <User size={16} className="info-icon" />
              <div>
                <div className="info-label">Customer Name</div>
                <div className="info-value">{callData?.customerName || 'N/A'}</div>
              </div>
            </div>
            <div className="call-info-item">
              <Clock size={16} className="info-icon" />
              <div>
                <div className="info-label">Duration</div>
                <div className="info-value">{formatDuration(callData?.duration)}</div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="disposition-form">
          {/* Vapi Structured Output Display */}
          {callData?.vapiStructuredOutput && (
            <div className="vapi-output-section">
              <h3 className="section-title">
                <FileText size={18} className="section-icon" />
                Call Analysis
              </h3>
              <div className="vapi-output-content">
                {Object.entries(callData.vapiStructuredOutput).map(([key, value]) => (
                  <div key={key} className="vapi-output-item">
                    <span className="vapi-output-key">{key}:</span>
                    <span className="vapi-output-value">
                      {typeof value === 'object' ? JSON.stringify(value) : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disposition Buttons */}
          <div className="disposition-section">
            <h3 className="section-title">
              <CheckCircle size={18} className="section-icon" />
              Select Disposition <span className="required-mark">*</span>
            </h3>
            <div className="disposition-grid">
              {dispositions.map((disp) => (
                <button
                  key={disp.value}
                  type="button"
                  className={`disposition-btn ${selectedDisposition === disp.value ? 'selected' : ''}`}
                  style={{
                    '--disp-color': disp.color,
                    borderColor: selectedDisposition === disp.value ? disp.color : 'rgba(234, 72, 180, 0.3)',
                    background: selectedDisposition === disp.value
                      ? `${disp.color}20`
                      : 'rgba(0, 0, 0, 0.4)',
                  }}
                  onClick={() => setSelectedDisposition(disp.value)}
                >
                  {disp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Call Notes */}
          <div className="notes-section">
            <h3 className="section-title">
              <MessageSquare size={18} className="section-icon" />
              Call Notes <span className="required-mark">*</span>
            </h3>
            <textarea
              className="call-notes-textarea"
              placeholder="Enter detailed call notes here..."
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              rows={6}
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="disposition-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !selectedDisposition || !callNotes.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                'Submit Disposition'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CallDisposition;
