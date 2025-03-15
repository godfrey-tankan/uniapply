
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGraduationCap, FiMenu, FiX, FiSearch } from 'react-icons/fi';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container px-4 mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <FiGraduationCap className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-blue-600">UniApply</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#programs" className="text-sm font-medium text-gray-800 hover:text-blue-600">Programs</a>
          <a href="#statistics" className="text-sm font-medium text-gray-800 hover:text-blue-600">Statistics</a>
          <a href="#news" className="text-sm font-medium text-gray-800 hover:text-blue-600">News & Memos</a>
          <a href="#about" className="text-sm font-medium text-gray-800 hover:text-blue-600">About</a>
          <Link to="/register" className="text-sm font-medium text-gray-800 hover:text-blue-600">Register</Link>
          <Link to="/login" className="text-sm font-medium text-gray-800 hover:text-blue-600">Login</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button className="p-2 text-gray-700 hover:text-blue-600">
            <FiSearch className="h-5 w-5" />
          </button>
          <Link 
            to="/register" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Apply Now
          </Link>
        </div>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FiMenu className="h-6 w-6" />
          )}
        </button>

        {isMobileMenuOpen && (
          <div className="fixed inset-x-0 top-[72px] bg-white/95 backdrop-blur-md shadow-md p-4 border-t border-gray-100 z-40 md:hidden">
            <nav className="flex flex-col gap-4 mb-4">
              <a 
                href="#programs" 
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Programs
              </a>
              <a 
                href="#statistics" 
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Statistics
              </a>
              <a 
                href="#news" 
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                News & Memos
              </a>
              <a 
                href="#about" 
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </a>
              <Link 
                to="/register" 
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
            </nav>
            <div className="flex flex-col gap-2">
              <button className="flex items-center justify-start px-4 py-2 text-sm font-medium border border-gray-300 rounded-md">
                <FiSearch className="h-4 w-4 mr-2" />
                Search
              </button>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-center"
              >
                Apply Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
