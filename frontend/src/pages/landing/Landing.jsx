import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import Footer from '../../app/ui/Footer';
import womanImg from '../../shared/assets/illustrations/landing.png';
import logoImg from '../../shared/assets/illustrations/linkedin_icon.png';
const LandingPage = () => {
    const navigate = useNavigate();

  const categories = [
    'Engineering', 'Business development', 'Finance', 'Administrative Assistant',
    'Retail employee', 'Help Desk', 'Operations', 'Information Technology',
    'Marketing', 'Personnel support', 'Education', 'Sales'
  ];

  const softwareTools = [
    'E-commerce platforms', 'Recruiting Software', 'Software for CRM systems',
    'Social Networking Software', 'HR systems', 'Project Management Software'
  ];

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-header-container">
          <div className="landing-logo">
          <div className="landing-logo">
              <img width="60" height="60" 
                src={logoImg}
                alt="LinkedIn Analogue"
                className="landing-logo-img"
              />
          </div>
          </div>
          <div className="landing-header-buttons">
            <button
              className="landing-btn-outline"
              onClick={() => navigate('/auth?mode=signin')}
            >
              Sign In
            </button>
            <button
              className="landing-btn-primary"
              onClick={() => navigate('/auth?mode=signup')}
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-container">
          <div className="landing-hero-content">
            <h1 className="landing-hero-title">
              Welcome<br/>
              to the community<br/>
              specialists!
            </h1>
            <button className="landing-hero-google"  onClick={() => navigate('/auth?mode=signin')}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Login with Google
            </button>
            <button
              className="landing-hero-email"
              onClick={() => navigate('/auth?mode=signin')}
            >
              Sign in by email address
            </button>
            <p className="landing-hero-terms">
              By clicking "Continue" to join or sign in, you agree to the terms of the LinkedIn User Agreement, Privacy Policy, and Cookie Policy.
            </p>
            <button
              className="landing-hero-join"
              onClick={() => navigate('/auth?mode=signup')}
            >
              Not on LinkedIn? Join now
            </button>
          </div>

          <div className="landing-hero-illustration">
            <img  width="450" height="450"
              src={womanImg}
              alt="Professional woman with laptop"
              className="landing-hero-image"
            />
          </div>

        </div>
      </section>

      <section className="landing-section-gray">
        <div className="landing-container">
          <h2 className="landing-section-title">
            Find a suitable vacancy or internship
          </h2>
          <div className="landing-categories">
            {categories.map((category, index) => (
              <button key={index} className="category-chip">{category}</button>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section-white">
        <div className="landing-container">
          <h2 className="landing-section-title">
            Post your vacancy so millions of people can see it
          </h2>
          <button className="landing-post-vacancy">Post a vacancy</button>
        </div>
      </section>

      <section className="landing-section-gray">
        <div className="landing-container">
          <div className="landing-software-grid">
            <div className="landing-software-content">
              <h2 className="landing-section-title">Discover the best software tools</h2>
              <p className="landing-software-description">
                Connect with buyers who have first-hand experience to find the best products for you.
              </p>
            </div>
            <div className="landing-software-tags">
              {softwareTools.map((tool, index) => (
                <button key={index} className="software-chip">{tool}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section-purple">
        <div className="landing-container">
          <h2 className="landing-cta-title">
            Connect with your colleagues,<br/>
            classmates and friends on LinkedIn.
          </h2>
        <button
        className="landing-cta-button"
        onClick={() => navigate('/auth?mode=signin')}
        >
        Login
        </button>

        </div>
      </section>

    <Footer />
    </div>
  );
};

export default LandingPage;
