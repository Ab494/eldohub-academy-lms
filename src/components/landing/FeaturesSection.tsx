import React from 'react';
import { BookOpen, Users, Award, GraduationCap } from 'lucide-react';

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

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose TechBridge Academy?
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
              <h3 className="text-xl font-bold text-card-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
