import React from 'react';
import LogoutButton from './Logout-btn';

const Layout = ({ children }) => {
  return (
    <div id="layout">
      <header>
        <div><h1>Webbutik</h1></div>
        
        <div className='logout-btn-container'> <LogoutButton /></div>
      </header>
      {/* <nav>
        <ul>
         
         
        </ul>
        <div className='logout-btn-container'> <LogoutButton /></div>
      </nav> */}
      <main>
        {children} {/* Här renderas innehållet för varje sida */}
      </main>
      <footer>
        <p>© 2024 Webbutik - All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Layout;
