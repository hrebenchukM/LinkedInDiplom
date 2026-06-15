import React, { useContext, useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppContext from '../../features/appContext/AppContext';
import { login, register } from '../../features/auth/authApi.js';
import { mapAuthResponse } from '../../features/auth/mapAccount.js';
import { setAuthTokens } from '../../shared/api/tokens.js';
import { ApiError, getErrorMessage } from '../../shared/lib/apiError.js';
import './Auth.css';
import logoImg from '../../shared/assets/illustrations/linkedin_icon.png';

const AuthPage = () => {
  const { applyAuthSession } = useContext(AppContext);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initialMode = params.get('mode') === 'signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState(initialMode);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleModeSwitch = (nextMode) => {
    setMode(nextMode);
    setError('');
    setFieldErrors({});
  };

  const handleAuthError = (err) => {
    if (err instanceof ApiError) {
      setFieldErrors(err.fieldErrors || {});

      if (err.status === 401) {
        setError('Неверный email или пароль');
        return;
      }

      setError(getErrorMessage(err));
      return;
    }

    setError(getErrorMessage(err));
  };

  const completeAuth = ({ account, tokens }) => {
    if (!tokens?.accessToken) {
      throw new Error('Access token was not returned by the server.');
    }

    setAuthTokens(tokens);
    applyAuthSession({ account, tokens });
    navigate('/app');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setFieldErrors({ confirmPassword: ['Passwords do not match'] });
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'signup') {
        const registerResponse = await register({
          email: formData.email,
          password: formData.password,
        });

        const registerMapped = mapAuthResponse(registerResponse);

        if (registerMapped.tokens?.accessToken) {
          completeAuth(registerMapped);
          return;
        }

        const loginResponse = await login({
          email: formData.email,
          password: formData.password,
        });

        completeAuth(mapAuthResponse(loginResponse));
        return;
      }

      const loginResponse = await login({
        email: formData.email,
        password: formData.password,
      });

      completeAuth(mapAuthResponse(loginResponse));
    } catch (err) {
      handleAuthError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderFieldError = (fieldName) => {
    const messages = fieldErrors[fieldName];
    if (!messages?.length) return null;

    return (
      <p className="auth-field-error" role="alert">
        {messages.join(' ')}
      </p>
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <img
          src={logoImg}
          width="64"
          height="64"
          alt="LinkedIn Analogue"
          className="landing-logo-img"
        />
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome to your</h1>
          <h2 className="auth-subtitle">professional community</h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error ? (
            <div className="auth-error" role="alert">
              {error}
            </div>
          ) : null}

          <div className="auth-input-group">
            <div className="auth-input-icon">
              <Mail size={20} />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="auth-input"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
          {renderFieldError('email')}

          <div className="auth-input-group">
            <div className="auth-input-icon">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              className="auth-input"
              value={formData.password}
              onChange={handleChange}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
            />
            <button
              type="button"
              className="auth-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {renderFieldError('password')}

          {mode === 'signup' && (
            <>
              <div className="auth-input-group">
                <div className="auth-input-icon">
                  <Lock size={20} />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  className="auth-input"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {renderFieldError('confirmPassword')}
            </>
          )}

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
          </button>

          {mode === 'signup' && (
            <p className="auth-terms">
              By Signing Up, you agree to our{' '}
              <a href="#">Terms of Service</a> and{' '}
              <a href="#">Privacy Policy</a>
            </p>
          )}

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" className="auth-google-btn">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            className="auth-switch-btn"
            onClick={() => handleModeSwitch(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
