import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Ensure global CSS is imported first
import '@mantine/core/styles.css'; // Mantine core styles
import '@mantine/notifications/styles.css'; // Mantine notifications styles
import './styles/colors.css'; // Custom global color system
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { MantineProvider } from '@mantine/core';
import { theme } from './styles/theme';

Amplify.configure(awsExports);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <MantineProvider theme={theme} forceColorScheme="light">
      <App />
    </MantineProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();