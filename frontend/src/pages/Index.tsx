
import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import StatsSection from '../components/StatsSection';
import ProgramsSection from '../components/ProgramsSection';
import AboutSection from '../components/AboutSection';
import UpdatesSection from '../components/UpdatesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import Footer from '../components/Footer';

const Index = () => {
  useEffect(() => {
    // Smooth scroll behavior for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            window.scrollTo({
              top: targetElement.offsetTop - 80, // Offset for navbar
              behavior: 'smooth'
            });
          }
        }
      });
    });

    // Cleanup
    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', function (e) {});
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ProgramsSection />
      <AboutSection />
      <UpdatesSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default Index;
