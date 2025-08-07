import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith('/chat/');

  return (
    <div style={{
      minHeight: isChatPage ? 'auto' : '100vh',
      height: isChatPage ? '100vh' : 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header />
      <main style={{ 
        flex: isChatPage ? 'none' : 1, 
        paddingTop: isChatPage ? '60px' : '60px',
        height: isChatPage ? 'calc(100vh - 60px)' : 'auto'
      }}>
        {children}
      </main>
      {!isChatPage && <Footer />}
    </div>
  );
};

export default Layout;

export { default as Header } from './Header';
export { default as Footer } from './Footer';
export {default as Contact} from './Contact';