/**
 * Top Navigation Bar Component
 * Clean, polished SaaS navigation with brand mark and responsive links
 */

'use client';

import React from 'react';
import { BrainCircuit, History, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Practice' },
    { href: '/history', label: 'History', icon: History },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname === '/role-selection';
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group focus-ring rounded-lg">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Interview<span className="text-blue-600">IQ</span>
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
              <Sparkles className="w-3 h-3 text-sky-500" />
              Free Mock Practice
            </span>
          </div>

          {/* Links & Action */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1" aria-label="Main Navigation">
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center gap-1.5 focus-ring',
                      active
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4 text-slate-500" />}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="hidden sm:block pl-2 border-l border-slate-200">
              <Link
                href="/#upload-section"
                className="btn btn-primary btn-sm"
              >
                <span>Upload Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}