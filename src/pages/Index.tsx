import React from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import FeaturedCoursesSection from '@/components/landing/FeaturedCoursesSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <TestimonialsSection />
      <FeaturesSection />
      <FeaturedCoursesSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
