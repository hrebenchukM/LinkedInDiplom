import React, { useState ,useContext} from 'react';
import { Image, Video, Calendar } from 'lucide-react';
import '../CreatePost/CreatePost.css';
import CreatePostModal from '../Modals/CreatePostModal';
import AppContext from '../../features/appContext/AppContext';
import { fileUrl } from '../../shared/api/files';

const CreatePost = ({ onPostCreated }) => {
  const { user, profile } = useContext(AppContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user || !profile?.user) return null;

  const u = profile.user;

const modalUser = {
  name: `${u.firstName} ${u.secondName}`.trim(),
  avatar: u.avatarUrl ? fileUrl(u.avatarUrl) : null
};
  return (
    <>
    <div className="create-post">
      <div className="create-post-input">
<img
  src={u?.avatarUrl
    ? `${fileUrl(u.avatarUrl)}`
    : 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  }
  alt="Profile"
  className="create-post-avatar"
/>

        <input
            type="text"
            placeholder="Start your post"
            className="create-post-textbox"
            onClick={() => setIsModalOpen(true)}
            readOnly
          />
      </div>

      <div className="create-post-actions">
        <button className="post-action-btn">
          <Image size={20} color="#7C3AED" />
          <span>Photo</span>
        </button>
        <button className="post-action-btn">
          <Video size={20} color="#7C3AED" />
          <span>Video</span>
        </button>
        <button className="post-action-btn">
          <Calendar size={20} color="#7C3AED" />
          <span>Event</span>
        </button>
      </div>
    </div>
        <CreatePostModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onPostCreated={onPostCreated}
  user={modalUser}
/>

    </>
  );
};

export default CreatePost;
