import { MantineProvider, AppShell } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from './styles/theme';
import { LandingPage } from './components/landing';
import { Header, Footer } from './components/layout';

// Import Mantine core styles
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

// Main UI component
function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <AppShell
        header={{ height: 60 }}
        padding={0}
        style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <AppShell.Header>
          <Header />
        </AppShell.Header>
        
        <AppShell.Main style={{ paddingTop: 60, flex: 1 }}>
          <LandingPage />
        </AppShell.Main>
        
        <Footer />
      </AppShell>
    </MantineProvider>
  );
}

export default App;
