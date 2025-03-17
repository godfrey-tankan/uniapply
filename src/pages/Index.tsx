
import React from 'react';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Statistics from '@/components/Statistics';
import Programs from '@/components/Programs';
import News from '@/components/News';
import About from '@/components/About';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Statistics />
      <Programs />
      <News />
      <About />
      <Footer />
    </div>
  );
};

export default Index;
