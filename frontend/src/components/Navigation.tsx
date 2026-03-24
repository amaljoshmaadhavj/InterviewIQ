/**
 * Top Navigation Bar Component
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, History } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-cyan-400/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/20 group-hover:border-cyan-400/50"
            >
              <Brain className="w-6 h-6 text-cyan-400" />
            </motion.div>
            <span className="text-xl font-bold text-white hidden sm:block">
              Interview<span className="text-cyan-400">IQ</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              href="/history"
              className={cn(
                'px-4 py-2 rounded-lg transition-all flex items-center gap-2',
                'text-sm font-medium',
                isActive('/history')
                  ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
