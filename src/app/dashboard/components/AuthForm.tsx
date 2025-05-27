"use client"

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import FormInput from '../../auth/components/FormInput';
import PasswordStrengthMeter from '../../auth/components/PasswordStrength';

export default function AuthForm() {
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

        router.refresh(); // Refresh to update the session state
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

        // Show success message
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
    <main className="flex items-center justify-center min-h-full">
      <section className="w-full max-w-md rounded-lg p-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isSignIn ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isSignIn ? 'Sign in to your account' : 'Sign up to get started'}
          </p>
        </header>
          
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
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || (!isSignIn && password !== confirmPassword)}
          >
            {isLoading ? (
              <Icon icon="ph:circle-notch" className="w-5 h-5 animate-spin" />
            ) : (
              isSignIn ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <footer className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isSignIn ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => {
                setIsSignIn(!isSignIn);
                setError(null);
                setPassword('');
                setConfirmPassword('');
              }}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isSignIn ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </footer>
      </section>
    </main>
  );
} 