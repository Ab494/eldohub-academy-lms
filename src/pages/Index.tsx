import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';

const features = [
  {
    icon: BookOpen,
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with real-world experience and proven track records.',
  },
  {
    icon: Users,
    title: 'Community Learning',
    description: 'Join a vibrant community of learners and collaborate on projects together.',
  },
  {
    icon: Award,
    title: 'Recognized Certificates',
    description: 'Earn industry-recognized certificates that boost your career prospects.',
  },
  {
    icon: GraduationCap,
    title: 'Flexible Learning',
    description: 'Learn at your own pace with lifetime access to all course materials.',
  },
];

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute top-40 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Now enrolling for 2024 cohort
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
                Unlock Your
                <span className="block text-primary">Full Potential</span>
                With ELDOHUB
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Join Africa's leading learning platform. Master in-demand tech skills 
                with expert-led courses, hands-on projects, and a supportive community.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/register">
                    Start Learning Free
                    <ArrowRight className="w-5 h-5 ml-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/courses">
                    <Play className="w-5 h-5 mr-1" />
                    Watch Demo
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative lg:pl-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="absolute inset-0 gradient-hero rounded-3xl rotate-3 opacity-20" />
                <div className="relative rounded-3xl shadow-medium w-full aspect-video bg-muted flex items-center justify-center">
                  <div className="text-center p-8">
                    <GraduationCap className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Course preview coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 gradient-dark">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">0</p>
              <p className="text-sm text-primary-foreground/70">Active Students</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">0</p>
              <p className="text-sm text-primary-foreground/70">Expert Instructors</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">0</p>
              <p className="text-sm text-primary-foreground/70">Courses Available</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-primary-foreground mb-1">0%</p>
              <p className="text-sm text-primary-foreground/70">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose ELDOHUB Academy?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section - Empty State */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular Courses
            </h2>
            <p className="text-lg text-muted-foreground">
              Explore our most loved courses by students worldwide
            </p>
          </div>

          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Courses Yet</h3>
            <p className="text-muted-foreground mb-6">Courses will appear here once they are added.</p>
            <Button variant="hero" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 gradient-dark relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join ELDOHUB Academy and unlock your potential. 
            Start your free trial today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="xl" asChild className="bg-primary-foreground text-secondary hover:bg-primary-foreground/90">
              <Link to="/register">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                ELDO<span className="text-primary">HUB</span>
              </span>
            </div>
            <p className="text-muted-foreground">
              &copy; 2024 ELDOHUB Academy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
