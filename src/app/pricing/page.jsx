"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Zap, Crown, CreditCard, Star } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState("monthly")
  const router =  useRouter()

  const pricingTiers = [
    {
      name: "Free",
      price: billingCycle === "monthly" ? 0 : 0.00,
      description: "Perfect for beginners and casual bloggers",
      credits: 50,
      features: [
        "50 AI Credits per month",
        "All AI Features",
        "Standard editing tools",
        "Community support",
        ,
      ],
      icon: <Zap className="h-5 w-5" />,
      popular: false,
      color: "bg-blue-500/10 text-blue-500",
      buttonVariant: "outline",
    },
    {
      name: "Pro",
      price: billingCycle === "monthly" ? 6.99 : 69.99,
      description: "Ideal for regular content creators",
      credits: 150,
      features: [
        "150 AI Credits per month",
        "All AI Features",
        "Enhanced editing tools",
        "24/7 Email support",
        
        
      ],
      icon: <Star className="h-5 w-5" />,
      popular: true,
      color: "bg-primary/10 text-primary",
      buttonVariant: "default",
    },
    {
      name: "Premium",
      price: billingCycle === "monthly" ? 9.99 : 99.99,
      description: "For professional content creators",
      credits: 300,
      features: [
        "300 AI Credits per month",
        "All AI Features",
        "Advanced AI tools",
        "24/7 Call & Email Priority support",
      
      
        ,
      ],
      icon: <Crown className="h-5 w-5" />,
      popular: false,
      color: "bg-purple-500/10 text-purple-500",
      buttonVariant: "outline",
    },
  ]

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-40 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-40 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl opacity-70"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium mb-4 border-primary/30">
              <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
              Pricing Plans
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Choose the Perfect Plan for Your <span className="text-primary">Creative Journey</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Unlock the power of AI-assisted blogging with our flexible pricing plans. Each tier provides more credits to
            fuel your creative process.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mt-8 mb-8"
          >
            <div className="bg-muted/50 p-1 rounded-full">
              <Button
                variant={billingCycle === "monthly" ? "default" : "ghost"}
                size="sm"
                className="rounded-full px-4"
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === "yearly" ? "default" : "ghost"}
                size="sm"
                className="rounded-full px-4"
                onClick={() => setBillingCycle("yearly")}
              >
                Yearly
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-0 px-2 py-0 text-xs">
                  Save 20%
                </Badge>
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex"
            >
              <Card
                className={`flex flex-col w-full border ${tier.popular ? "border-primary shadow-lg shadow-primary/10" : ""} relative overflow-hidden`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <CardHeader>
                  <div className={`w-12 h-12 rounded-full ${tier.color} flex items-center justify-center mb-4`}>
                    {tier.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground ml-2">
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg mb-6 ${tier.color} flex items-center justify-between`}>
                    <div>
                      <div className="text-sm font-medium">AI Credits</div>
                      <div className="text-2xl font-bold">{tier.credits}</div>
                    </div>
                    <Sparkles className="h-8 w-8 opacity-80" />
                  </div>

                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-primary mr-2 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button variant={tier.buttonVariant} className="w-full" size="lg" onClick = {()=>router.push('/sign-in')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {tier.popular ? "Subscribe" : "Get Started"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-muted/30 rounded-lg p-6 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-2">Need a custom plan?</h3>
            <p className="text-muted-foreground mb-4">
              For teams and businesses with specific requirements, we offer tailored solutions.
            </p>
            <Button variant="outline">Contact Sales</Button>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="bg-blue-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-5 w-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Assistance</h3>
            <p className="text-muted-foreground">
              Our AI tools help you create better content faster with smart suggestions and editing.
            </p>
          </div>

          <div>
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Flexible Credit System</h3>
            <p className="text-muted-foreground">
              Use credits for various AI features like content generation, rephrasing, and more.
            </p>
          </div>

          <div>
            <div className="bg-purple-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Premium Support</h3>
            <p className="text-muted-foreground">
              Get help when you need it with our dedicated support team ready to assist you.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

