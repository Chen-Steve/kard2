"use client"

import AuthForm from './dashboard/components/AuthForm';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8">
        <AuthForm />
      </div>
    </div>
  );
}