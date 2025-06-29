import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';

const Home: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <Hero />
      <Features />
    </div>
  );
};

export default Home;