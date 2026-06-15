import React, { useState, useContext } from 'react';
import { Image, Calendar, Star } from 'lucide-react';
import Modal from '../../app/ui/Modal';
import AppContext from '../../features/appContext/AppContext';
import { fileUrl } from '../../shared/api/files';
import {
  createPost,
  uploadPostMedia,
} from '../content/contentApi.js';
import {
  mapPostToCreateRequest,
} from '../content/mapContent.js';
import { getErrorMessage } from '../../shared/lib/apiError.js';

const CreatePostModal = ({ isOpen, onClose, user, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { token } = useContext(AppContext);

  const resetForm = () => {
    setContent('');
    setImage(null);
    setImagePreview(null);
    setError('');
  };

  const handleImageChange = (file) => {
    setImage(file ?? null);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('Authentication required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let mediaIds;

      if (image) {
        const uploaded = await uploadPostMedia(image);
        if (uploaded?.id) {
          mediaIds = [uploaded.id];
        }
      }

      const payload = mapPostToCreateRequest({
        content,
        visibility: 'Public',
        mediaIds,
      });

      await createPost(payload);

      resetForm();
      onClose();
      onPostCreated?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const avatarSrc = user?.avatar || '/img/avatar-placeholder.png';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a post">
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <img
            src={avatarSrc}
            alt={user?.name || 'User'}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>
            {user?.name || 'User'}
          </span>
        </div>

        {error ? <div className="auth-field-error">{error}</div> : null}

        <div className="form-group">
          <textarea
            className="form-textarea"
            placeholder="What do you want to talk about?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              minHeight: '150px',
              border: 'none',
              background: '#f3f4f6',
              fontSize: '16px',
            }}
            required
          />
        </div>

        {imagePreview ? (
          <div style={{ marginBottom: '16px' }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxWidth: '100%', borderRadius: '8px' }}
            />
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            id="post-image-input"
            onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
          />

          <button
            type="button"
            className="icon-btn"
            onClick={() => document.getElementById('post-image-input')?.click()}
          >
            <Image size={28} color={image ? '#2563eb' : '#6b7280'} />
          </button>

          <button type="button" className="icon-btn">
            <Calendar size={28} color="#6b7280" />
          </button>
          <button type="button" className="icon-btn">
            <Star size={28} color="#6b7280" />
          </button>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreatePostModal;
