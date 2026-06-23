'use client';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <Navbar />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
      <Chatbot />
    </AuthProvider>
  );
}
