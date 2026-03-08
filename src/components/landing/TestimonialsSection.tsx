import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Chioma Eze',
    role: 'Frontend Developer',
    initials: 'CE',
    quote: 'TechBridge helped me land my first developer role in just 4 months. The project-based curriculum is unmatched.',
    rating: 5,
  },
  {
    name: 'Samuel Adeyemi',
    role: 'Data Analyst',
    initials: 'SA',
    quote: 'The instructors are genuinely invested in your success. I went from zero coding to analyzing real datasets.',
    rating: 5,
  },
  {
    name: 'Fatima Bello',
    role: 'Full-Stack Engineer',
    initials: 'FB',
    quote: 'Flexible pace, supportive community, and industry-relevant skills. Best learning investment I\'ve made.',
    rating: 5,
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-12 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border"
            >
              <div className="w-11 h-11 rounded-full gradient-hero flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary-foreground">{t.initials}</span>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-card-foreground mb-2 leading-relaxed">"{t.quote}"</p>
                <p className="text-sm font-semibold text-card-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
