"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text">
              HTML Hub
            </span>
          </Link>
          <p className="mt-2 text-foreground/70">
            Create an account to save and manage your code creations
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-xl shadow-lg p-8">
          <SignUp 
            appearance={{
              elements: {
                card: "bg-card border-0 shadow-none",
                headerTitle: "text-foreground",
                headerSubtitle: "text-foreground/70",
                socialButtonsBlockButton: "border-border",
                socialButtonsBlockButtonText: "text-foreground",
                dividerLine: "bg-border",
                dividerText: "text-foreground/70",
                formFieldLabel: "text-foreground",
                formFieldInput: "bg-background border-border text-foreground",
                formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                footerActionText: "text-foreground/70",
                footerActionLink: "text-primary hover:text-primary/90",
              }
            }}
          />
        </div>
        
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-primary hover:text-primary/90 text-sm font-medium"
          >
            ← Back to Editor
          </Link>
        </div>
      </div>
    </div>
  );
}