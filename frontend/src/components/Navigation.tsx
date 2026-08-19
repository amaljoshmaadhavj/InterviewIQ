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
      <div className="glass border-x-0 border-t-0 border-b border-slate-200/70 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 8, scale: 1.05 }}
                className="relative p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-float group-hover:shadow-glow transition-shadow"
              >
                <BrainCircuit className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
              </motion.div>
              <span className="text-lg font-extrabold tracking-tight text-slate-800 hidden sm:block">
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
                      'focus-ring relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2',
                      isActive(link.href)
                        ? 'text-blue-700'
                        : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50'
                    )}
                  >
                    {isActive(link.href) && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-blue-100/80 border border-blue-200"
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