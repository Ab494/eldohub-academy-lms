import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setIsSuccess(true);
      toast({
        title: 'Password reset successful!',
        description: 'You can now sign in with your new password.',
      });
    } catch (error: any) {
      toast({
        title: 'Reset failed',
        description: error.response?.data?.message || 'Invalid or expired reset token.',
        variant: 'destructive',
      });
      setIsTokenValid(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || isTokenValid === false) {
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
              <h1 className="text-3xl font-bold text-foreground mb-4">Invalid reset link</h1>
              <p className="text-muted-foreground mb-8">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <div className="space-y-4">
                <Link to="/forgot-password">
                  <Button className="w-full">Request new reset link</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
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
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-4">Password reset successful!</h1>
              <p className="text-muted-foreground mb-8">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Link to="/login">
                <Button className="w-full">Sign in now</Button>
              </Link>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Reset your password</h1>
            <p className="text-muted-foreground">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-12 pr-10"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12 pr-10"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" className="w-full h-12" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset password'
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
            <h2 className="text-4xl font-bold mb-4">Secure Your Account</h2>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Create a strong password to keep your learning journey safe and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;