"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Sparkles, PenTool, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col px-2">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl opacity-70"></div>
      </div>

      {/* Back Button */}
      <div className="container z-10 pt-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 md:p-8 relative z-10">
        {/* Left Column - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md px-4 py-8 md:py-12 md:pr-12"
        >
          <div className="mb-6 flex items-center">
            <div className="relative w-10 h-10 mr-3 overflow-hidden">
              <img
                src="/inkwiselogo.svg"
                className="w-full h-full object-contain"
                alt="Inkwise AI Logo"
              />
              <div
                className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"
                style={{ animationDuration: "3s" }}
              ></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Inkwise AI</h1>
              <p className="text-sm text-muted-foreground">
                Smart Blog Platform
              </p>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl max-md:text-2xl font-bold mb-4">
            Welcome back to your{" "}
            <span className="text-primary">creative journey</span>
          </h2>

          <p className="text-muted-foreground mb-8">
            Sign in to access your AI-powered blog creation tools, manage your
            content, and continue crafting exceptional stories.
          </p>

          <div className="hidden md:block space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: <Sparkles className="h-5 w-5 text-primary" />,
                  title: "AI-Powered Writing",
                  description:
                    "Create, edit, and enhance your content with advanced AI tools",
                },
                {
                  icon: <PenTool className="h-5 w-5 text-primary" />,
                  title: "Intuitive Editor",
                  description:
                    "Enjoy a seamless writing experience with our user-friendly interface",
                },
                {
                  icon: <Zap className="h-5 w-5 text-primary" />,
                  title: "Instant Publishing",
                  description:
                    "Share your content with the world in just a few clicks",
                },
              ].map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Column - Sign In Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center justify-center p-4 md:p-6 ">
            <SignIn />
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
