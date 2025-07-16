import React, { useState, useEffect } from 'react';
import { Auth } from '@aws-amplify/auth'; // Corrected import path for Auth
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import './App.css'; // Your existing styling

// --- Placeholder Components ---

function PatientDashboard() {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="App-header">
      <h1>Patient Dashboard</h1>
      <p>Welcome, Patient!</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}

function ProviderDashboard() {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="App-header">
      <h1>Provider Dashboard</h1>
      <p>Welcome, Provider!</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}

function UnauthorizedPage() {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  return (
    <div className="App-header">
      <h1>Unauthorized Access</h1>
      <p>You do not have permission to view this page or your role is not assigned.</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  async function checkAuthStatus() {
    try {
      await Auth.currentAuthenticatedUser();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }
  }

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="App-header">
      <h1>Welcome to Altheros Capital</h1>
      {!isAuthenticated ? (
        <button onClick={handleLoginClick}>Login / Signup</button>
      ) : (
        <p>You are already logged in. Please navigate to your dashboard or sign out.</p>
      )}
      <p>Message from backend: (This will be replaced by your actual API calls) </p>
    </div>
  );
}

// --- New Login Component with Role Selection ---
function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const redirectToCognitoHostedUI = (role) => {
    // These values come from your amplify/aws-exports.js after `amplify push`
    // For local development, you might get these from your Cognito User Pool App Client settings
    const cognitoDomain = process.env.REACT_APP_COGNITO_DOMAIN; // e.g., 'your-domain.auth.us-east-1.amazoncognito.com'
    const redirectUri = process.env.REACT_APP_COGNITO_REDIRECT_URI_SIGNIN; // e.g., 'http://localhost:3000/callback'
    const clientId = process.env.REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID; // Your App Client ID

    if (!cognitoDomain || !redirectUri || !clientId) {
        setError('Cognito environment variables are not set. Please check .env file.');
        console.error('Missing Cognito env vars:', { cognitoDomain, redirectUri, clientId });
        return;
    }

    const responseType = 'token'; // Or 'code' for Authorization Code Grant flow
    const scope = 'openid profile email'; // Desired scopes

    // Custom 'state' parameter to pass the role
    const customState = `signup:${role}`; // e.g., "signup:patient" or "signup:provider"

    const url = `https://${cognitoDomain}/oauth2/authorize?` +
                `response_type=${responseType}&` +
                `client_id=${clientId}&` +
                `redirect_uri=${encodeURIComponent(redirectUri)}&` +
                `scope=${encodeURIComponent(scope)}&` +
                `state=${encodeURIComponent(customState)}`; // Pass the custom state

    window.location.assign(url);
  };

  return (
    <div className="App-header">
      <h1>Login / Signup</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Please select your role to continue:</p>
      <button onClick={() => redirectToCognitoHostedUI('patient')}>
        I am a Patient
      </button>
      <button onClick={() => redirectToCognitoHostedUI('provider')}>
        I am a Provider
      </button>
    </div>
  );
}

// --- New Callback Page to process Cognito redirect ---
function CallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    handleAuthRedirect();
  }, [location, navigate]);

  const handleAuthRedirect = async () => {
    try {
      // Amplify should automatically process the tokens from the URL hash/query string
      // after the hosted UI redirect. Call Auth.currentAuthenticatedUser() to ensure
      // the session is properly loaded and to get user attributes.
      const user = await Auth.currentAuthenticatedUser();

      // Extract 'state' parameter from the URL
      const params = new URLSearchParams(location.search + location.hash.replace('#', '&'));
      const state = params.get('state');

      let intendedRole = null;
      if (state && state.startsWith('signup:')) {
        intendedRole = state.split(':')[1];
        console.log('Intended role from URL state:', intendedRole);
      } else {
        console.warn('No or invalid state parameter found in callback URL. Relying on Cognito user attributes.');
      }

      // Fetch user attributes, including custom:role, which might already be assigned by Cognito
      const userAttributes = await Auth.userAttributes(user);
      const currentCognitoRole = userAttributes.find(attr => attr.Name === 'custom:role')?.Value;

      // If the role is not yet assigned (e.g., first-time signup) or needs confirmation
      if (!currentCognitoRole && intendedRole) {
        console.log(`Attempting to assign new user to group: ${intendedRole}`);
        // Call your backend route to assign the user to the Cognito group
        const idToken = user.signInUserSession.idToken.jwtToken;
        const accessToken = user.signInUserSession.accessToken.jwtToken;

        const response = await fetch('http://localhost:5000/api/auth/add-to-group', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`, // Use ID token for group assignment verification
            'X-Access-Token': accessToken // You might send access token too if backend needs it
          },
          body: JSON.stringify({ role: intendedRole })
        });

        if (response.ok) {
          console.log('User successfully assigned to group on backend.');
          // After successful group assignment, re-check user to get updated attributes
          await Auth.currentAuthenticatedUser({ bypassCache: true }); // Bypass cache to get fresh attributes
          // Then redirect to the appropriate dashboard
          if (intendedRole === 'patient') {
            navigate('/patient');
          } else if (intendedRole === 'provider') {
            navigate('/provider');
          } else {
            navigate('/unauthorized');
          }
        } else {
          const errorData = await response.json();
          console.error('Failed to assign group via backend:', errorData);
          navigate('/unauthorized', { state: { message: 'Failed to assign role after login.' } });
        }
      } else if (currentCognitoRole) {
        // User already has a role assigned in Cognito, redirect based on that
        console.log('User already has role in Cognito:', currentCognitoRole);
        if (currentCognitoRole === 'patient') {
          navigate('/patient');
        } else if (currentCognitoRole === 'provider') {
          navigate('/provider');
        } else {
          navigate('/unauthorized');
        }
      } else {
        // This case might happen if no state was passed and no role is assigned
        console.warn('Authentication successful but no role determined. Redirecting to unauthorized.');
        navigate('/unauthorized');
      }

    } catch (error) {
      console.error('Error during authentication callback:', error);
      navigate('/login', { state: { message: 'Authentication failed. Please try again.' } });
    }
  };

  return (
    <div className="App-header">
      <h1>Processing authentication...</h1>
      <p>Please wait, do not close this page.</p>
    </div>
  );
}

// --- Main App Component ---
function App() {
  // The overall App component wrapping the router
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackPage />} /> {/* This is your callback URL */}
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        {/* Fallback for any unhandled routes */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;