import React, { useState, useContext } from 'react';
import { Image, Calendar, Star } from 'lucide-react';
import Modal from '../../app/ui/Modal';
import AppContext from '../../features/appContext/AppContext';
import { fileUrl } from '../../shared/api/files';

const CreatePostModal = ({ isOpen, onClose, profile,user, onPostCreated }) => {

  const [content, setContent] = useState('');
  const { request } = useContext(AppContext);
const [image, setImage] = useState(null);

 const handleSubmit = async (e) => {
  e.preventDefault();

  const form = new FormData();
  form.append('content', content);
  if (image) {
    form.append('image', image); // 👈 ключ ВАЖЕН
  }

  try {
    await request(
      'api://post',
      {
        method: 'POST',
        body: form
      },
      true
    );

    setContent('');
    setImage(null);
    onClose();
    onPostCreated?.();
  }
  catch (err) {
    alert(err?.data || 'Failed to create post');
  }
};


  const avatarSrc =
    user?.avatar
      ? (user.avatar)
      : 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a post">
      <form onSubmit={handleSubmit}>

        {/* ===== USER INFO ===== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}
        >
          <img
            src={avatarSrc}
            alt={user?.name}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <span style={{ fontWeight: 600, fontSize: '16px' }}>
            {user?.name}
          </span>
        </div>

        {/* ===== CONTENT ===== */}
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
              fontSize: '16px'
            }}
            required
          />
        </div>

        {/* ===== ACTION ICONS ===== */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          id="post-image-input"
          onChange={e => setImage(e.target.files?.[0] || null)}
        />

        <button
          type="button"
          className="icon-btn"
          onClick={() => document.getElementById('post-image-input').click()}
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

        {/* ===== ACTIONS ===== */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Publish
          </button>
        </div>

      </form>
    </Modal>
  );
};

export default CreatePostModal;
