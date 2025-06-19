import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import logo from './logo.png';
import { auth, provider } from './firebase';
import Home from './Elements/Home';
import About from './Elements/About';
import { getAuth, signInWithPopup, setPersistence, browserLocalPersistence, signOut, onAuthStateChanged } from 'firebase/auth';
import Admin from './Elements/Admin';
import Competitions from './Elements/Competitions';
import Login from './Elements/Login';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import Menu from '@mui/material/Menu';


// Your admin emails
const adminEmails = [
  'mpritheshboopathy@gmail.com',
  'sujaiaravindakannan@gmail.com'
];

function Navbar({ user, isAdmin, handleSignIn, handleSignOut }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  console.log(open)

  return (
    <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="left slide-up">
        <img src={logo} className={`logo ${scrolled ? 'visible logo' : ''}`} alt="logo" />
        <span className={`brand ${scrolled ? 'fade-out' : ''}`}>AluminUS</span>
      </div>
      <div className='desktop_app'>
        <nav className="nav-links slide-up">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/competitions" className={location.pathname === '/competitions' ? 'active' : ''}>Competitions</Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About Us</Link>
          {isAdmin && <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link>}
        </nav>
        <div className="action slide-up">
          {user ? (
            <button onClick={handleSignOut}>Sign Out</button>
          ) : (
            ""
          )}
        </div>
      </div>
      <div className='mobile_app'><button onClick={(e) => {open === false ? setOpen(true) : setOpen(false)}} className='options'><MenuRoundedIcon /></button></div>
      <div className={`${open === false ? 'hide' : 'open'} slide-up`}>
        <Link to="/" onClick={() => setOpen(false)} className={location.pathname === '/' ? 'active' : ''}>Home</Link>
        <Link to="/competitions" onClick={() => setOpen(false)} className={location.pathname === '/competitions' ? 'active' : ''}>Competitions</Link>
        <Link to="/about" onClick={() => setOpen(false)} className={location.pathname === '/about' ? 'active' : ''}>About Us</Link>
        {isAdmin && (
          <Link to="/admin" onClick={() => setOpen(false)} className={location.pathname === '/admin' ? 'active' : ''}>Admin</Link>
        )}
        <div className="action slide-up">
          {user ? (
            <button onClick={handleSignOut}>Sign Out</button>
          ) : (
            ""
          )}
        </div>
      </div>
    </header>
  );
}



function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authInstance = getAuth();
    setPersistence(authInstance, browserLocalPersistence)
      .then(() => {
        onAuthStateChanged(authInstance, (u) => {
          if (u) {
            setUser(u);
            setIsAdmin(adminEmails.includes(u.email));
          } else {
            setUser(null);
            setIsAdmin(false);
          }
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
        setLoading(false);
      });
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const signedInUser = result.user;
      setUser(signedInUser);
      setIsAdmin(adminEmails.includes(signedInUser.email));
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  if (loading) {
    return (
      <div className="dot-loader">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <Login handleSignIn={handleSignIn} />
    );
  }

  return (
    <Router>
      <Navbar user={user} isAdmin={isAdmin} handleSignIn={handleSignIn} handleSignOut={handleSignOut} />
      <main id="main-content">
        <section className="section light" data-theme="light">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/competitions"
              element={
                <div>
                  <div className="hero-section ">
                    <div className='margin_top'>
                      <h1 className="slide-up" style={{ fontSize: '52px' }}>Where Talent Meets Opportunity</h1>
                      <p className="slide-up" style={{ animationDelay: '0.2s' }}>
                        Discover, participate, and shine in competitions that challenge and inspire.
                      </p>
                    </div>
                  </div>
                  <Competitions user={user} adminEmails={adminEmails} />
                </div>
              }
            />
            <Route
              path="/admin"
              element={isAdmin ? <Admin user={user} adminEmails={adminEmails} /> : <Navigate to="/" />}
            />
          </Routes>
        </section>
      </main>
    </Router>
  );
}

export default App;
