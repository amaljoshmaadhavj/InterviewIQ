/**
 * Top Navigation Bar Component
 * Premium glassy nav with brand mark and responsive links
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, History } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/history', label: 'History', icon: History },
  ];

  const isActive = (path: string) =>
    pathname === path || (path !== '/' && pathname?.startsWith(path));

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="glass border-x-0 border-t-0 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.05 }}
                className="relative p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-400/30 group-hover:border-violet-400/60 transition-colors"
              >
                <BrainCircuit className="w-5 h-5 text-violet-300" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </motion.div>
              <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
                Interview<span className="gradient-text">IQ</span>
              </span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-1.5">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={cn(
                      'focus-ring relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                      isActive(link.href)
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {isActive(link.href) && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-500/15 to-indigo-500/15 border border-violet-400/25"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    {Icon && <Icon className="relative z-10 w-4 h-4" />}
                    <span className="relative z-10 hidden sm:inline">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}