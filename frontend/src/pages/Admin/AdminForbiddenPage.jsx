import { useNavigate } from 'react-router-dom';
import './admin.css';

export default function AdminForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="admin-forbidden">
        <h1>Access denied</h1>
        <p>This section is available only for Admin users.</p>
        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => navigate('/app')}
        >
          Back to app
        </button>
      </div>
    </div>
  );
}
