import { createRoot } from 'react-dom/client';
import App from './app/App.jsx';
import { ThemeProvider } from './app/theme/ThemeContext.jsx';
import { LocaleProvider } from './app/i18n/LocaleContext.jsx';
import '../index.css';
import './app/theme/theme.css';
import './app/theme/theme-overrides.css';

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </ThemeProvider>,
);

