"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Youtube,
  Github,
  Twitter,
  Instagram,
  Mail,
  ArrowRight,
  Sparkles,
  PenTool,
  BookOpen,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return

    setIsSubscribing(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubscribing(false)
      setSubscribed(true)
      setEmail("")

      // Reset success message after 3 seconds
      setTimeout(() => setSubscribed(false), 3000)
    }, 1500)
  }

  return (
    <footer className="border-t bg-gradient-to-b from-background to-background/80 pt-10 pb-6">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col">
            <div className="flex items-center mb-4">
              <Sparkles className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-bold">InkWise AI</h2>
            </div>
            <p className="text-muted-foreground mb-4 max-w-xs">
              The intelligent writing assistant that helps you craft exceptional blog content in minutes, not hours.
            </p>
            <div className="flex space-x-4 mt-2">
              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" prefetch={false}>
                  <Youtube className="h-5 w-5" />
                  <span className="sr-only">YouTube</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" prefetch={false}>
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" prefetch={false}>
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors" prefetch={false}>
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Features", href: "/features" },
                { name: "Pricing", href: "/pricing" },
                { name: "Blog", href: "/blog" },
                { name: "Dashboard", href: "/dashboard" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
                  >
                    <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-2">
              {[
                { name: "Writing Tips", href: "/resources/writing-tips", icon: <PenTool className="h-4 w-4" /> },
                { name: "AI Tutorials", href: "/resources/tutorials", icon: <Sparkles className="h-4 w-4" /> },
                { name: "Documentation", href: "/docs", icon: <BookOpen className="h-4 w-4" /> },
                { name: "Support", href: "/support", icon: <MessageSquare className="h-4 w-4" /> },
              ].map((resource) => (
                <li key={resource.name}>
                  <Link
                    href={resource.href}
                    className="text-muted-foreground hover:text-primary transition-colors flex items-center"
                  >
                    <span className="mr-2 text-primary/70">{resource.icon}</span>
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider mb-4">Stay Updated</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Subscribe to our newsletter for the latest features, tips, and AI writing insights.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex max-w-xs">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="rounded-r-none focus-visible:ring-primary/70"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribing || subscribed}
                  required
                />
                <Button type="submit" className="rounded-l-none" disabled={isSubscribing || subscribed}>
                  {isSubscribing ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Joining
                    </span>
                  ) : subscribed ? (
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Joined
                    </span>
                  ) : (
                    "Join"
                  )}
                </Button>
              </div>
              {subscribed && (
                <p className="text-green-500 text-xs mt-1">Thanks for subscribing! Check your inbox soon.</p>
              )}
            </form>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              <Mail className="h-4 w-4 mr-2" />
              <a href="mailto:contact@inkwise.ai" className="hover:text-primary transition-colors">
                contact@inkwise.ai
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} InkWise AI - All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

