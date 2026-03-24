import type { Metadata } from 'next';
import { Providers } from '@/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'InterviewIQ - AI Interview Practice Platform',
  description: 'Practice coding interviews with AI-powered interviewer. Get real-time feedback and improve your interview skills.',
  keywords: ['interview', 'practice', 'AI', 'coding', 'interview prep'],
  authors: [{ name: 'InterviewIQ' }],
  openGraph: {
    title: 'InterviewIQ',
    description: 'AI-powered interview practice platform',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-950 text-white antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
