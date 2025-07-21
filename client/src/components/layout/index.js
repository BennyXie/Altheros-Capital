import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Header />
      <main style={{ flex: 1, paddingTop: '60px' }}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

export { default as Header } from './Header';
export { default as Footer } from './Footer';
export {default as Contact} from './Contact';