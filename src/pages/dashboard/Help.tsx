import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  Search,
  FileText,
  Video,
  Users,
  Shield,
  CreditCard,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/store/AuthContext';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'How do I enroll in a course?',
    answer: 'Browse our course catalog, select a course you\'re interested in, and click "Enroll Now". If the course requires approval, your request will be reviewed by the instructor. Once approved, you\'ll have full access to the course materials.',
  },
  {
    category: 'Getting Started',
    question: 'How do I track my progress?',
    answer: 'Your progress is automatically tracked as you complete lessons. Visit your Dashboard to see your enrolled courses and completion percentages. Each course shows a progress bar indicating how far along you are.',
  },
  {
    category: 'Courses',
    question: 'Can I download course materials?',
    answer: 'Some courses offer downloadable resources like PDFs, code files, or additional reading materials. Check the lesson resources section within each course. Video content is typically streamed and not available for download.',
  },
  {
    category: 'Courses',
    question: 'How long do I have access to a course?',
    answer: 'Once enrolled, you have lifetime access to the course content. You can revisit lessons, re-watch videos, and access materials at any time. However, live sessions or time-limited offers may have specific deadlines.',
  },
  {
    category: 'Certificates',
    question: 'How do I get a certificate?',
    answer: 'Certificates are issued upon completing all required lessons and assignments in a course. Once you reach 100% completion, your certificate will be automatically generated and available in the Certificates section of your dashboard.',
  },
  {
    category: 'Certificates',
    question: 'Are certificates verifiable?',
    answer: 'Yes! Each certificate has a unique verification code. Employers or institutions can verify your certificate using our verification portal by entering the certificate ID.',
  },
  {
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a password reset link valid for 24 hours. If you\'re logged in, you can change your password from Settings > Security.',
  },
  {
    category: 'Account',
    question: 'Can I change my email address?',
    answer: 'For security reasons, email addresses cannot be changed directly. Please contact our support team with verification of your identity to request an email change.',
  },
  {
    category: 'Payments',
    question: 'What payment methods are accepted?',
    answer: 'We accept M-Pesa, credit/debit cards (Visa, Mastercard), and bank transfers. Payment options may vary by region. All transactions are secured with industry-standard encryption.',
  },
  {
    category: 'Payments',
    question: 'Can I get a refund?',
    answer: 'We offer a 7-day refund policy for paid courses if you\'ve completed less than 20% of the content. Free courses are not eligible for refunds. Contact support with your order details to request a refund.',
  },
];

const categories = [
  { name: 'Getting Started', icon: BookOpen },
  { name: 'Courses', icon: Video },
  { name: 'Certificates', icon: FileText },
  { name: 'Account', icon: Settings },
  { name: 'Payments', icon: CreditCard },
];

const Help: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFAQs = faqItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          How can we help you?
        </h1>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions or get in touch with our support team
        </p>
      </div>

      {/* Search */}
      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-base"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant={selectedCategory === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(null)}
        >
          All Topics
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.name}
            variant={selectedCategory === cat.name ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.name)}
            className="gap-1.5"
          >
            <cat.icon className="w-4 h-4" />
            {cat.name}
          </Button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Frequently Asked Questions
        </h2>
        {filteredFAQs.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No results found. Try a different search term or contact support.
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {filteredFAQs.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-lg border border-border px-4 shadow-card"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                  <div className="flex items-start gap-3">
                    <span className="text-sm px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {item.category}
                    </span>
                    <span>{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 pl-20">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Contact Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-card rounded-xl border border-border p-6 shadow-card text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Email Support</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get help via email within 24 hours
          </p>
          <a
            href="mailto:support@techbridge.academy"
            className="text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            support@techbridge.academy
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card text-center">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-accent" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Live Chat</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Chat with us Mon-Fri, 9AM-5PM EAT
          </p>
          <Button variant="outline" size="sm" className="gap-1.5">
            <MessageCircle className="w-4 h-4" />
            Start Chat
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-card text-center">
          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
            <Phone className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Phone Support</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Call us for urgent matters
          </p>
          <a
            href="tel:+254700000000"
            className="text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            +254 700 000 000
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-foreground mb-4 text-center">
          Helpful Resources
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="#"
            className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Documentation</p>
              <p className="text-sm text-muted-foreground">Browse our guides</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <Video className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Video Tutorials</p>
              <p className="text-sm text-muted-foreground">Watch how-to videos</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Community Forum</p>
              <p className="text-sm text-muted-foreground">Connect with learners</p>
            </div>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Privacy & Terms</p>
              <p className="text-sm text-muted-foreground">Read our policies</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Help;
