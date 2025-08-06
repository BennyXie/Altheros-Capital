import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import amplifyConfig from './config/amplifyConfig';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PreLoginPage from './pages/PreLoginPage.jsx';
import PreSignUpPage from './pages/PreSignUpPage.jsx';
import AuthCallback from './components/AuthCallback.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import ProviderDashboard from './pages/ProviderDashboard.jsx';
import UserCompleteProfilePage from './pages/UserCompleteProfilePage.jsx';
import ProviderCompleteProfilePage from './pages/ProviderCompleteProfilePage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './components/landing/LandingPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ProviderAccessPage from './pages/ProviderAccessPage.jsx';
import ProviderLookupPage from './pages/ProviderLookupPage.jsx';
import ProviderProfilePage from './pages/ProviderProfilePage.jsx';
import ChatSelectionPage from './pages/ChatSelectionPage.jsx';
import ChatRoomPage from './pages/ChatRoomPage.jsx';
import ClearAuthPage from './pages/ClearAuthPage.jsx';
import Layout from './components/layout';

Amplify.configure(amplifyConfig);

const AppRoutes = () => {
  const { isAuthenticated, profileStatus } = useAuth();
  const location = useLocation();

  // If user is authenticated but needs role assignment, redirect to auth callback
  // But don't redirect if they're already on the auth callback page
  if (isAuthenticated && profileStatus?.needsRoleAssignment && location.pathname !== '/auth/callback') {
    return <Navigate to="/auth/callback" replace />;
  }

  return (
    <Routes>
      <Route path="/prelogin" element={<Layout><PreLoginPage /></Layout>} />
      <Route path="/presignup" element={<Layout><PreSignUpPage /></Layout>} />
      <Route path="/clear-auth" element={<Layout><ClearAuthPage /></Layout>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/about" element={<Layout><AboutPage /></Layout>} />
      <Route path="/providers" element={<Layout><ProviderAccessPage /></Layout>} />
      <Route path="/provider-lookup" element={<Layout><ProviderLookupPage /></Layout>} />
      <Route path="/provider-profile/:id" element={<Layout><ProviderProfilePage /></Layout>} />
      <Route 
        path="/chats" 
        element={
          <Layout>
            <ProtectedRoute skipProfileCheck={true}>
              <ChatSelectionPage />
            </ProtectedRoute>
          </Layout>
        } 
      />
      <Route 
        path="/chat/:chatId" 
        element={
          <Layout>
            <ProtectedRoute skipProfileCheck={true}>
              <ChatRoomPage />
            </ProtectedRoute>
          </Layout>
        } 
      />
      <Route
        path="/notifications"
        element={
          <Layout>
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/settings"
        element={
          <Layout>
            <ProtectedRoute skipProfileCheck={true}>
              <SettingsPage />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/user-dashboard"
        element={
          <Layout>
            <ProtectedRoute requiredRole="patient">
              <UserDashboard />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/provider-dashboard"
        element={
          <Layout>
            <ProtectedRoute requiredRole="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/complete-profile"
        element={
          <Layout>
            <ProtectedRoute requiredRole="patient">
              <UserCompleteProfilePage />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/update-profile"
        element={
          <Layout>
            <ProtectedRoute requiredRole="patient">
              <UserCompleteProfilePage />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/provider-complete-profile"
        element={
          <Layout>
            <ProtectedRoute requiredRole="provider">
              <ProviderCompleteProfilePage />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/provider-update-profile"
        element={
          <Layout>
            <ProtectedRoute requiredRole="provider">
              <ProviderCompleteProfilePage />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/user-dashboard' : '/'} />} />
    </Routes>
  );
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;