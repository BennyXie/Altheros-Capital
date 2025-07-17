import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;

export { default as Header } from './Header';
export { default as Footer } from './Footer';
export {default as Contact} from './Contact';