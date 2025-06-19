import { MantineProvider, AppShell } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { theme } from './styles/theme';
import { LandingPage } from './components/landing';
import { AboutPage, LoginPage, SignupPage } from './pages';
import { Header, Footer } from './components/layout';
import ScrollToTop from './components/ScrollToTop';

// Import Mantine core styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// Import theme overrides (this handles all our custom colors)
import './styles/theme-override.css';

// Main UI component
function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme="light" withGlobalStyles withNormalizeCSS>
      <Notifications />
      <Router>
        <ScrollToTop />
        <AppShell
          header={{ height: 60 }}
          padding={0}
          style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column'
          }}
        >
          <AppShell.Header>
            <Header />
          </AppShell.Header>
          
          <AppShell.Main style={{ 
            paddingTop: 60, 
            flex: 1
          }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </AppShell.Main>
          
          <Footer />
        </AppShell>
      </Router>
    </MantineProvider>
  );
}

export default App;
