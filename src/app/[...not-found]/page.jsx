"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, Search, Sparkles, FileEdit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  // Animated text for the typewriter effect
  const phrases = [
    "The page seems to have vanished...",
    "This page is taking a creative break...",
    "Our AI couldn't find this page...",
    "This page is still being written...",
  ]

  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    if (!mounted) return

    const interval = setInterval(() => {
      setPhraseIndex((prevIndex) => (prevIndex + 1) % phrases.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [mounted, phrases.length])

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      <main className="flex-grow flex items-center justify-center p-4">
        <motion.div
          className="max-w-2xl w-full text-center"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* 404 Text */}
          <motion.div className="relative mb-6" variants={itemVariants}>
            <h1 className="text-8xl md:text-9xl font-bold text-primary/10">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl md:text-5xl font-bold text-primary">Page Not Found</span>
            </div>
          </motion.div>

          {/* Animated message */}
          <motion.div className="h-12 mb-8 flex items-center justify-center" variants={itemVariants}>
            <motion.p
              key={phraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-lg text-muted-foreground"
            >
              {phrases[phraseIndex]}
            </motion.p>
          </motion.div>

          {/* Illustration */}
          <motion.div className="mb-8 flex justify-center" variants={itemVariants}>
            <div className="relative w-64 h-64">
              {/* Paper with text lines */}
              <motion.div
                className="absolute inset-0 bg-card border rounded-md shadow-md p-6"
                initial={{ rotate: -5 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              >
                <div className="space-y-3">
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </motion.div>

              {/* Pencil */}
              <motion.div
                className="absolute -top-6 -right-6 transform rotate-45"
                animate={{
                  x: [0, 10, 0],
                  y: [0, -5, 0],
                  rotate: [45, 40, 45],
                }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              >
                <div className="w-3 h-24 bg-yellow-400 rounded-t-sm"></div>
                <div className="w-3 h-6 bg-zinc-800 rounded-b-sm"></div>
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-zinc-600"></div>
              </motion.div>

              {/* Sparkles */}
              <motion.div
                className="absolute top-1/4 right-1/4"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Sparkles className="text-primary h-6 w-6" />
              </motion.div>
            </div>
          </motion.div>

         
          

          {/* Navigation options */}
          <motion.div className="flex flex-wrap justify-center gap-4" variants={itemVariants}>
            <Link href="/" prefetch={false}>
              <Button variant="outline" className="gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>

            <Link href="/dashboard" prefetch={false}>
              <Button variant="outline" className="gap-2">
                <FileEdit className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>

            <Link href="/contact" prefetch={false}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Contact Support
              </Button>
            </Link>
          </motion.div>

          
        </motion.div>
      </main>
    </div>
  )
}

