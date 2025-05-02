"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Sparkles, PenTool, Zap, ArrowRight, Brain, Lightbulb, Wand2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const features = [
    {
      icon: <Wand2 className="h-5 w-5" />,
      text: "AI-Powered Content Generation",
    },
    {
      icon: <PenTool className="h-5 w-5" />,
      text: "Smart Editing Tools",
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      text: "Idea Suggestions",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      text: "Instant Publishing",
    },
  ]

  // Simulated typing effect text options
  const typingTexts = ["engaging blog posts", "compelling stories", "professional articles", "creative content"]

  const [typingIndex, setTypingIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    if (!mounted) return

    const currentText = typingTexts[typingIndex]

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentText.substring(0, displayText.length + 1))
        setTypingSpeed(150)

        if (displayText === currentText) {
          setIsDeleting(true)
          setTypingSpeed(50)
          setTimeout(() => setTypingSpeed(150), 1500)
        }
      } else {
        setDisplayText(currentText.substring(0, displayText.length - 1))

        if (displayText === "") {
          setIsDeleting(false)
          setTypingIndex((typingIndex + 1) % typingTexts.length)
        }
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, typingIndex, typingSpeed, mounted])

  // Simulate loading states for demo purposes
  const handleStartCreating = (e) => {
    e.preventDefault()
    setIsCreating(true)

    // Simulate API call or navigation delay
    setTimeout(() => {
      window.location.href = "/createBlog"
    }, 2000)
  }

  const handleViewDashboard = (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call or navigation delay
    setTimeout(() => {
      window.location.href = "/dashboard"
    }, 2000)
  }

  if (!mounted) return null

  return (
    <div className="px-3">

    
    <div className="relative overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-70"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
            <motion.div variants={fadeIn}>
              <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium mb-4 border-primary/30">
                <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
                AI-Powered Blog Platform
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Create <span className="text-primary">brilliant</span> <br />
              <span className="relative">
                <span className="inline-block min-h-[1.5em]">{displayText}</span>
                <span className="absolute -right-1 top-0 h-full w-[3px] bg-primary animate-blink"></span>
              </span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Unleash your creativity with Inkwise AI, the intelligent writing assistant that helps you craft
              exceptional blog content in minutes, not hours.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-wrap gap-3 pt-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-1.5 text-sm bg-muted/50 px-3 py-1.5 rounded-full">
                  {feature.icon}
                  <span>{feature.text}</span>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="group" onClick={handleStartCreating} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Start Creating
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <Button size="lg" variant="outline" onClick={handleViewDashboard} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "View Dashboard"
                )}
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-[500px]">
              {/* Main Image/Illustration */}
              <div className="relative z-10 rounded-2xl overflow-hidden border shadow-xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-background via-muted to-background p-2">
                  {/* Editor UI Mockup */}
                  <div className="h-full rounded-xl overflow-hidden border bg-card shadow-sm">
                    {/* Editor Header */}
                    <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                      <div className="flex space-x-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-xs font-medium">Inkwise Editor</div>
                      <div className="w-4"></div>
                    </div>

                    {/* Editor Content */}
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-muted/60 rounded w-3/4"></div>
                      <div className="h-6 bg-muted/60 rounded w-1/2"></div>
                      <div className="h-6 bg-muted/60 rounded w-5/6"></div>
                      <div className="h-6 bg-muted/60 rounded w-2/3"></div>
                      <div className="h-6 bg-muted/60 rounded w-4/5"></div>

                      {/* AI Suggestion */}
                      <div className="mt-6 border border-primary/30 rounded-lg p-3 bg-primary/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-primary" />
                          <div className="text-xs font-medium text-primary">AI Suggestion</div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-primary/20 rounded w-full"></div>
                          <div className="h-4 bg-primary/20 rounded w-5/6"></div>
                          <div className="h-4 bg-primary/20 rounded w-4/6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-6 -right-6 bg-card shadow-lg rounded-lg p-3 border"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3, ease: "easeInOut" }}
              >
                <Sparkles className="h-5 w-5 text-primary" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 bg-card shadow-lg rounded-lg p-3 border"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4, ease: "easeInOut", delay: 1 }}
              >
                <PenTool className="h-5 w-5 text-primary" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10x", label: "Faster Content Creation" },
              { value: "1000+", label: "Active Users" },
              { value: "50k+", label: "Blogs Created" },
              { value: "99%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

