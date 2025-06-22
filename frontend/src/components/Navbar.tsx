
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHomePage, setIsHomePage] = useState(false);
  const token = localStorage.getItem('authToken');
  const urlPathname = window.location.pathname;


  useEffect(() => {
    setIsHomePage(urlPathname === '/');
  }, [urlPathname]);

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'py-3 bg-white/90 shadow-sm backdrop-blur-md dark:bg-navy-dark/90'
        : 'py-6 bg-transparent'
        }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-navy dark:text-white">
          <GraduationCap size={32} className="text-teal" />
          <span className="text-xl font-bold">UniApply</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-6">
            {isHomePage && (
              <>
                <a href="#programs" className="text-navy-light hover:text-teal transition-colors dark:text-slate-light dark:hover:text-teal">Programs</a>
                <a href="#about" className="text-navy-light hover:text-teal transition-colors dark:text-slate-light dark:hover:text-teal">About</a>
                <a href="#stats" className="text-navy-light hover:text-teal transition-colors dark:text-slate-light dark:hover:text-teal">Statistics</a>
                <a href="#updates" className="text-navy-light hover:text-teal transition-colors dark:text-slate-light dark:hover:text-teal">Updates</a>
              </>
            )}
          </div>
          {!isLoggedIn && (
            <div className="flex gap-3">
              <Link to="/auth" className="px-4 py-2 rounded-md bg-white border border-teal text-teal hover:bg-teal/5 transition-colors dark:bg-transparent">
                Log In
              </Link>
              <Link to="/dashboard" className="px-4 py-2 rounded-md bg-teal text-white hover:bg-teal-dark transition-colors">
                Apply Now
              </Link>
            </div>
          )}
          {isLoggedIn && (
            <div className="flex gap-3">
              <Link to="/dashboard" className="px-4 py-2 rounded-md bg-white border border-teal text-teal hover:bg-teal/5 transition-colors dark:bg-transparent">
                Dashboard
              </Link>
              <Link to="/auth?tab=logout" className="px-4 py-2 rounded-md bg-teal text-white hover:bg-teal-dark transition-colors">
                Log Out
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-navy dark:text-white"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[60px] bg-white dark:bg-navy-dark z-40 animate-fade-in">
          <div className="container mx-auto px-6 py-8 flex flex-col gap-6">
            {isHomePage && (
              <>
                <a
                  href="#programs"
                  className="text-lg py-3 border-b border-slate/10 text-navy-light dark:text-slate-light"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Programs
                </a>
                <a
                  href="#about"
                  className="text-lg py-3 border-b border-slate/10 text-navy-light dark:text-slate-light"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </a>
              </>
            )}
            <a
              href="#stats"
              className="text-lg py-3 border-b border-slate/10 text-navy-light dark:text-slate-light"
              onClick={() => setIsMenuOpen(false)}
            >
              Statistics
            </a>
            <a
              href="#updates"
              className="text-lg py-3 border-b border-slate/10 text-navy-light dark:text-slate-light"
              onClick={() => setIsMenuOpen(false)}
            >
              Updates
            </a>

            <div className="flex flex-col gap-3 mt-4">
              {!isLoggedIn && (
                <>
                  <Link
                    to="/auth"
                    className="py-3 rounded-md bg-white border border-teal text-teal dark:bg-transparent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/auth?tab=register"
                    className="py-3 rounded-md bg-teal text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Apply Now
                  </Link>
                </>
              )}
              {isLoggedIn && (
                <>
                  <Link
                    to="/dashboard"
                    className="py-3 rounded-md bg-white border border-teal text-teal dark:bg-transparent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/auth?tab=logout"
                    className="py-3 rounded-md bg-teal text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log Out
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
