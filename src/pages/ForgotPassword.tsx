import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiClient.post('/auth/forgot-password', { email: email.trim() });
      setIsSuccess(true);
      toast({
        title: 'Reset email sent!',
        description: 'Check your email for password reset instructions.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen grid lg:grid-cols-2">
        <div className="flex flex-col justify-center px-8 py-12 lg:px-12">
          <div className="mx-auto w-full max-w-md">
            <Link to="/" className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">OTI</span>
            </Link>

            <div className="text-center">
              <h1 className="text-3xl font-bold text-foreground mb-4">Check your email</h1>
              <p className="text-muted-foreground mb-8">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="text-primary hover:underline"
                  >
                    try again
                  </button>
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative gradient-hero">
          <div className="absolute inset-0 bg-secondary/20" />
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80"
            alt="Students learning"
            className="h-full w-full object-cover mix-blend-overlay"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">OTI</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Forgot password?</h1>
            <p className="text-muted-foreground">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button type="submit" variant="hero" className="w-full h-12" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send reset instructions'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Remember your password?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative gradient-hero">
        <div className="absolute inset-0 bg-secondary/20" />
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80"
          alt="Students learning"
          className="h-full w-full object-cover mix-blend-overlay"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-4">Reset Your Password</h2>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Get back to learning with just a few simple steps to reset your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;