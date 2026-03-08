import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, Clock, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-bl from-primary/8 via-transparent to-transparent" />
        <div className="absolute top-20 left-[10%] w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-[15%] w-96 h-96 bg-accent/8 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] left-[50%] w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
        {/* Geometric grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Now enrolling for 2025 cohort
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
              Unlock Your
              <span className="block">Full Potential With</span>
              <span className="text-primary">TechBridge</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Join Africa's leading learning platform. Master in-demand tech skills
              with expert-led courses, hands-on projects, and a supportive community.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button variant="hero" size="xl" asChild className="text-xl px-12 h-16 font-bold shadow-glow">
                <Link to="/register">
                  Start Learning Free
                  <ArrowRight className="w-6 h-6 ml-1" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" asChild className="text-muted-foreground hover:text-foreground">
                <Link to="/courses">
                  <Play className="w-4 h-4 mr-1" />
                  Watch Demo
                </Link>
              </Button>
            </div>
          </div>

          {/* Stylized course card mockup */}
          <div className="relative lg:pl-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              <div className="absolute inset-0 gradient-hero rounded-2xl rotate-2 opacity-20 scale-105" />
              <div className="relative rounded-2xl shadow-medium bg-card border border-border overflow-hidden">
                {/* Card thumbnail */}
                <div className="relative h-44 gradient-dark flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 30% 50%, hsl(var(--primary) / 0.4) 0%, transparent 60%), radial-gradient(circle at 80% 30%, hsl(var(--accent) / 0.3) 0%, transparent 50%)',
                    }}
                  />
                  <div className="relative text-center">
                    <div className="text-5xl mb-2">🚀</div>
                    <p className="text-secondary-foreground/60 text-sm font-medium tracking-wider uppercase">Featured Course</p>
                  </div>
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Bestseller
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-card-foreground mb-1">Full-Stack Web Development</h3>
                    <p className="text-sm text-muted-foreground">Master React, Node.js & MongoDB from scratch</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-xs font-bold text-primary-foreground">
                      AO
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Adebayo Ogunlesi</p>
                      <p className="text-xs text-muted-foreground">Senior Engineer</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="w-4 h-4 fill-primary" />
                      <span className="font-semibold">4.8</span>
                      <span className="text-muted-foreground">(234)</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>42 hours</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>1.2k</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Your progress</span>
                      <span className="font-semibold text-accent">64%</span>
                    </div>
                    <Progress value={64} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-extrabold text-card-foreground">₦25,000</span>
                    </div>
                    <Button variant="hero" size="sm">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
