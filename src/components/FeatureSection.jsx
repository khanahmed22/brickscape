"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Sparkles,
  PenTool,
  ImagePlus,
  Wand2,
  Brain,
  FileText,
  Pencil,
  SpellCheck,
  FileDigit,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState("generate")

  const router = useRouter()

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
      id: "generate",
      title: "AI Blog Generation",
      description: "Generate complete blog posts by simply providing a topic. Our AI handles the rest.",
      icon: <Brain className="h-10 w-10 text-primary" />,
      benefits: [
        { icon: <Sparkles className="h-5 w-5" />, text: "Generate full articles in seconds" },
        { icon: <FileText className="h-5 w-5" />, text: "Research-backed content" },
        { icon: <Wand2 className="h-5 w-5" />, text: "Multiple writing styles" },
      ],
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "enhance",
      title: "Content Enhancement",
      description: "Write your own content and let our AI tools enhance it to perfection.",
      icon: <PenTool className="h-10 w-10 text-primary" />,
      benefits: [
        { icon: <Pencil className="h-5 w-5" />, text: "AI paraphraser for better expression" },
        { icon: <FileDigit className="h-5 w-5" />, text: "Smart summarizer for concise content" },
        { icon: <SpellCheck className="h-5 w-5" />, text: "Advanced spellchecker and grammar tools" },
      ],
      image: "/placeholder.svg?height=300&width=400",
    },
    {
      id: "visuals",
      title: "Visual Content",
      description: "Enhance your blogs with stunning visuals, either uploaded or AI-generated.",
      icon: <ImagePlus className="h-10 w-10 text-primary" />,
      benefits: [
        { icon: <Wand2 className="h-5 w-5" />, text: "Generate custom images with AI" },
        { icon: <ImagePlus className="h-5 w-5" />, text: "Upload and organize your own images" },
        { icon: <Sparkles className="h-5 w-5" />, text: "Smart image suggestions based on content" },
      ],
      image: "/placeholder.svg?height=300&width=400",
    },
  ]

  return (
    <section className="relative py-20 overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-40 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl opacity-70"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center justify-center mb-4">
            <span className="bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium flex items-center">
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Powerful Features
            </span>
          </motion.div>

          <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold mb-4">
            Transform Your Blog Writing Experience
          </motion.h2>

          <motion.p variants={fadeIn} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Inkwise AI offers a complete suite of tools to revolutionize how you create, enhance, and visualize your
            blog content.
          </motion.p>
        </motion.div>

        <div className="mb-12">
          <Tabs defaultValue="generate" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 max-w-2xl mx-auto mb-8">
              {features.map((feature) => (
                <TabsTrigger
                  key={feature.id}
                  value={feature.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="flex items-center gap-2">
                    {feature.id === "generate" && <Brain className="h-4 w-4" />}
                    {feature.id === "enhance" && <PenTool className="h-4 w-4" />}
                    {feature.id === "visuals" && <ImagePlus className="h-4 w-4" />}
                    {feature.title.split(" ")[0]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {features.map((feature) => (
              <TabsContent key={feature.id} value={feature.id} className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                >
                  <div className="space-y-6">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl">
                      {feature.icon}
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold">{feature.title}</h3>

                    <p className="text-muted-foreground text-lg">{feature.description}</p>

                    <div className="space-y-4 pt-4">
                      {feature.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1 p-1.5 bg-primary/10 rounded-full">{benefit.icon}</div>
                          <div>
                            <p className="font-medium">{benefit.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button className="group mt-4" onClick={()=>router.push('/dashboard')}>
                      Try {feature.title.split(" ")[0]} Features
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="relative mx-auto max-w-[500px]">
                      <div className="relative z-10 rounded-2xl overflow-hidden border shadow-xl">
                        <div className="aspect-[4/3] bg-gradient-to-br from-background via-muted to-background p-2">
                          <Card className="h-full">
                            <CardContent className="p-0 h-full">
                              {/* Feature UI Mockup */}
                              <div className="bg-muted/50 px-4 py-2 border-b flex items-center justify-between">
                                <div className="flex space-x-1.5">
                                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="text-xs font-medium">Inkwise {feature.title}</div>
                                <div className="w-4"></div>
                              </div>

                              {feature.id === "generate" && (
                                <div className="p-4 space-y-4">
                                  <div className="border rounded-lg p-3">
                                    <p className="text-sm font-medium mb-2">Topic</p>
                                    <div className="h-8 bg-muted/60 rounded w-full"></div>
                                  </div>

                                  <div className="border border-primary/30 rounded-lg p-3 bg-primary/5">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Brain className="h-4 w-4 text-primary" />
                                      <div className="text-sm font-medium text-primary">Generated Blog</div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="h-4 bg-primary/20 rounded w-full"></div>
                                      <div className="h-4 bg-primary/20 rounded w-5/6"></div>
                                      <div className="h-4 bg-primary/20 rounded w-4/6"></div>
                                      <div className="h-4 bg-primary/20 rounded w-full"></div>
                                      <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {feature.id === "enhance" && (
                                <div className="p-4 space-y-4">
                                  <div className="border rounded-lg p-3">
                                    <p className="text-sm font-medium mb-2">Your Content</p>
                                    <div className="space-y-2">
                                      <div className="h-4 bg-muted/60 rounded w-full"></div>
                                      <div className="h-4 bg-muted/60 rounded w-5/6"></div>
                                      <div className="h-4 bg-muted/60 rounded w-4/6"></div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <div className="border rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1">
                                      <Pencil className="h-3 w-3" />
                                      Paraphrase
                                    </div>
                                    <div className="border rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1">
                                      <FileDigit className="h-3 w-3" />
                                      Summarize
                                    </div>
                                    <div className="border rounded-md px-3 py-1.5 text-xs font-medium flex items-center gap-1">
                                      <SpellCheck className="h-3 w-3" />
                                      Spellcheck
                                    </div>
                                  </div>

                                  <div className="border border-primary/30 rounded-lg p-3 bg-primary/5">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Wand2 className="h-4 w-4 text-primary" />
                                      <div className="text-sm font-medium text-primary">Enhanced Version</div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="h-4 bg-primary/20 rounded w-full"></div>
                                      <div className="h-4 bg-primary/20 rounded w-5/6"></div>
                                      <div className="h-4 bg-primary/20 rounded w-4/6"></div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {feature.id === "visuals" && (
                                <div className="p-4 space-y-4">
                                  <div className="border rounded-lg p-3">
                                    <p className="text-sm font-medium mb-2">Image Description</p>
                                    <div className="h-8 bg-muted/60 rounded w-full"></div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="border rounded-lg p-2 flex flex-col items-center justify-center gap-2">
                                      <div className="w-full aspect-square bg-muted/40 rounded-md flex items-center justify-center">
                                        <ImagePlus className="h-6 w-6 text-muted-foreground/50" />
                                      </div>
                                      <span className="text-xs">Upload Image</span>
                                    </div>

                                    <div className="border border-primary/30 rounded-lg p-2 flex flex-col items-center justify-center gap-2 bg-primary/5">
                                      <div className="w-full aspect-square bg-primary/20 rounded-md flex items-center justify-center">
                                        <Wand2 className="h-6 w-6 text-primary/70" />
                                      </div>
                                      <span className="text-xs text-primary">Generate with AI</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
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
                        {feature.id === "generate" && <Brain className="h-5 w-5 text-primary" />}
                        {feature.id === "enhance" && <PenTool className="h-5 w-5 text-primary" />}
                        {feature.id === "visuals" && <ImagePlus className="h-5 w-5 text-primary" />}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Testimonial/CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mt-20 bg-gradient-to-r from-primary/10 via-primary/5 to-background rounded-2xl p-8 md:p-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center justify-center mb-4">
                <span className="bg-primary/20 text-white rounded-full px-4 py-1.5 text-sm font-medium flex items-center">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Join 1000+ Content Creators
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your blog writing experience?</h3>

              <p className="text-muted-foreground mb-6">
                Start creating exceptional blog content in minutes with Inkwise AI&apos;s powerful features.
              </p>

              <Button size="lg" className="group" onClick={()=>router.push('/sign-up')}>
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "10x", label: "Faster Content Creation" },
                { value: "50k+", label: "Blogs Created" },
                { value: "1000+", label: "Active Users" },
                { value: "99%", label: "Satisfaction Rate" },
              ].map((stat, index) => (
                <div key={index} className="bg-background rounded-xl p-6 border shadow-sm">
                  <div className="text-3xl max-md:text-xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

