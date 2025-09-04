"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserTool {
  id: string;
  title: string;
  html: string;
  css: string;
  js: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [tools, setTools] = useState<UserTool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    } else if (isSignedIn) {
      fetchUserTools();
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchUserTools = async () => {
    try {
      const response = await fetch("/api/tools");
      if (response.ok) {
        const data = await response.json();
        // The API returns an object with a tools property, not directly an array
        setTools(data.tools || []);
      } else {
        console.error("Failed to fetch tools");
      }
    } catch (error) {
      console.error("Error fetching tools:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTool = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) {
      return;
    }

    try {
      const response = await fetch(`/api/tools/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTools(tools.filter(tool => tool.id !== id));
        alert("Tool deleted successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to delete tool: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting tool:", error);
      alert("Failed to delete tool. Please try again.");
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-4 text-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // This case is handled by the redirect above
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            My Dashboard
          </h1>
          <p className="text-foreground/70 mt-2">
            Welcome back, {user?.firstName || user?.username || "User"}!
          </p>
        </header>

        <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              My Code Creations
            </h2>
            <Link 
              href="/"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create New
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              <p className="mt-4 text-foreground">Loading your creations...</p>
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">No creations yet</h3>
              <p className="text-foreground/70 mb-4">
                You haven't saved any code creations yet. Start creating and save your work!
              </p>
              <Link 
                href="/"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Tool
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <div key={tool.id} className="border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-5 bg-card">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg text-foreground truncate">
                        {tool.title}
                      </h3>
                      <div className="flex gap-2">
                        <Link 
                          href={`/t/${tool.id}`}
                          className="p-1.5 text-foreground/70 hover:text-foreground hover:bg-accent rounded-md transition-colors"
                          title="View"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => deleteTool(tool.id)}
                          className="p-1.5 text-foreground/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                      {tool.html.replace(/<[^>]*>/g, "").substring(0, 100)}...
                    </p>
                    <div className="flex justify-between text-xs text-foreground/50">
                      <span>
                        Created: {new Date(tool.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        Updated: {new Date(tool.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}