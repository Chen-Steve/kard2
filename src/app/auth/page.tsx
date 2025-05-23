"use client"

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FormInput from './components/FormInput';
import PasswordStrengthMeter from './components/PasswordStrength';

export default function AuthPage() {
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignIn) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Update last login in Prisma
        await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id }),
        });

        router.push('/'); // Redirect to home page
      } else {
        // Validate passwords match
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        // Create user in Prisma
        await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.user!.id,
            email: data.user!.email,
          }),
        });

        // Show success message or redirect
        alert('Please check your email to verify your account.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen dot-pattern flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative">
      <div className={`absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 ${isLoading ? '' : 'hidden'}`}>
        <Icon icon="ph:circle-notch" className="animate-spin text-4xl text-black" />
      </div>
      <div className={`w-full ${isLoading ? 'blur-sm' : ''}`}>
        <div className="p-8 rounded-lg w-full max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-black">
              <Icon icon="pepicons-print:arrow-left" className="text-3xl" />
            </Link>
            <h1 className="text-3xl font-bold text-black">
              {isSignIn ? 'Login' : 'Sign Up'}
            </h1>
            <div className="w-8"></div>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              required
              error={false}
            />

            <FormInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              required
              error={false}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            {!isSignIn && password.length > 0 && (
              <>
                <FormInput
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  label="Confirm Password"
                  required
                  error={confirmPassword.length > 0 && password !== confirmPassword}
                  showPasswordToggle
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                />
                <PasswordStrengthMeter password={password} />
              </>
            )}

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black-500"
              disabled={isLoading || (!isSignIn && password !== confirmPassword)}
            >
              {isLoading ? (
                <Icon icon="ph:circle-notch" className="w-5 h-5 animate-spin" />
              ) : (
                isSignIn ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
        </div>
        <p className="text-center text-sm font-semibold text-black mt-4">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{' '}
          <button 
            onClick={() => {
              setIsSignIn(!isSignIn);
              setError(null);
              setPassword('');
              setConfirmPassword('');
            }}
            className="font-medium text-black underline hover:text-gray-800"
          >
            {isSignIn ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
} 