import './Splash.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import splashImg from '../../shared/assets/illustrations/splash.png';

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      navigate('/landing');
    }, 5000);

    return () => clearTimeout(t);
  }, []);


  return (
    <div className="splash-page">
      <div className="splash-content">
        <div className="splash-illustration">
          <img
            width={800} height={600}
            color='#6C5CE7'
            src={splashImg}
            alt="Splash illustration"
            className="splash-image"
          />
        </div>


        {/* <h1 className="splash-title">Linkedin Analogue</h1> */}

        <div className="splash-search">
          <input type="text" placeholder="Search professionals..." readOnly />
          <div className="search-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="8" cy="8" r="6" stroke="#9CA3AF" strokeWidth="2"/>
              <path d="M12.5 12.5L16.5 16.5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
