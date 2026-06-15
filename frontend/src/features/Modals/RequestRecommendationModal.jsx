import React, { useState } from 'react';
import Modal from '../../app/ui/Modal';

const RequestRecommendationModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Recommendation requested for:', searchQuery);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request for recommendation">
      <form onSubmit={handleSubmit}>
        <p style={{ fontSize: '16px', color: '#1f2937', marginBottom: '16px' }}>
          Help us personalize the question
        </p>

        <div className="form-hint" style={{ marginBottom: '20px' }}>Mandatory field</div>

        <div className="form-group">
          <label className="form-label required">Who to send the request to?</label>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: '#7c3aed' }}>Search for people *</span>
          </div>
          <input
            type="text"
            className="form-input"
            placeholder="Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
          />
        </div>

        <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
          <button type="submit" className="btn btn-primary">Continued</button>
        </div>
      </form>
    </Modal>
  );
};

export default RequestRecommendationModal;
