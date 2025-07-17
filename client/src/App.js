import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import amplifyConfig from './config/amplifyConfig';
import { AuthProvider, useAuth } from './context/AuthContext';
import PreLoginPage from './pages/PreLoginPage.jsx';
import PreSignUpPage from './pages/PreSignUpPage.jsx';
import AuthCallback from './components/AuthCallback.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import ProviderDashboard from './pages/ProviderDashboard.jsx';
import UserCompleteProfilePage from './pages/UserCompleteProfilePage.jsx';
import ProviderCompleteProfilePage from './pages/ProviderCompleteProfilePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './components/landing/LandingPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProviderAccessPage from './pages/ProviderAccessPage.jsx';
import Layout from './components/layout';

Amplify.configure(amplifyConfig);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/prelogin" element={<PreLoginPage />} />
      <Route path="/presignup" element={<PreSignUpPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/providers" element={<Layout><ProviderAccessPage /></Layout>} />
      <Route
        path="/user-dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider-dashboard"
        element={
          <ProtectedRoute requiredRole="provider">
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute>
            <UserCompleteProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider-complete-profile"
        element={
          <ProtectedRoute requiredRole="provider">
            <ProviderCompleteProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/prelogin'} />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;