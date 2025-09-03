"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-background shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                HTML Hub
              </span>
            </Link>
            <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  pathname === '/' 
                    ? 'border-b-2 border-primary text-foreground font-medium' 
                    : 'text-foreground/70 hover:border-primary/30 hover:text-foreground'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm transition-colors duration-200`}
              >
                Editor
              </Link>
              <Link
                href="/gallery"
                className={`${
                  pathname === '/gallery' 
                    ? 'border-b-2 border-primary text-foreground font-medium' 
                    : 'text-foreground/70 hover:border-primary/30 hover:text-foreground'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm transition-colors duration-200`}
              >
                Gallery
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}