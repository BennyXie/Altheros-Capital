import { MantineProvider, AppShell } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import amplifyConfig from './config/amplifyConfig';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { theme } from './styles/theme';
import { LandingPage } from './components/landing';
import { AboutPage, LoginPage, SignupPage, DashboardPage, CompleteProfilePage, ProviderAccessPage, AppointmentsPage } from './pages';
import { Header, Footer } from './components/layout';
import ScrollToTop from './components/ScrollToTop';

// Import Mantine core styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// Import global color system
import './styles/colors.css';

// Configure Amplify
Amplify.configure(amplifyConfig);

// Main UI component
function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme="light">
      <Notifications />
      <AuthProvider>
        <Router 
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
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
                <Route path="/providers" element={<ProviderAccessPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/complete-profile" element={
                  <ProtectedRoute>
                    <CompleteProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/appointments" element={
                  <ProtectedRoute>
                    <AppointmentsPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </AppShell.Main>
            
            <Footer />
          </AppShell>
        </Router>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
