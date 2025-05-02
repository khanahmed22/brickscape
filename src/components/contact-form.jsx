"use client"



import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Turnstile } from "@marsidev/react-turnstile"
import { motion } from "framer-motion"
import { Send, CheckCircle2, AlertCircle } from "lucide-react"

export default function ContactForm() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState(null)
  const [turnstileError, setTurnstileError] = useState(null)

  const formRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!turnstileToken) {
      setTurnstileError("Please complete the Cloudflare Turnstile challenge")
      return
    }

    setIsSubmitting(true)

    try {
      // In a real implementation, you would send the form data and turnstileToken to your API
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formState, turnstileToken }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // if (!response.ok) throw new Error('Failed to send message');

      setIsSubmitted(true)
      toast.success("Your message has been sent successfully!")

      // Reset form
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: "",
      })

      // Reset Turnstile
      setTurnstileToken(null)
    } catch (error) {
      toast.error("Failed to send message. Please try again.")
      console.error("Contact form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-lg shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Get in Touch</CardTitle>
        <CardDescription>Fill out the form below and we&apos;ll get back to you as soon as possible.</CardDescription>
      </CardHeader>

      <CardContent>
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Thank you for reaching out. We&apos;ve received your message and will respond shortly.
            </p>
            <Button variant="outline" onClick={() => setIsSubmitted(false)}>
              Send Another Message
            </Button>
          </motion.div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formState.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formState.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="How can we help you?"
                  value={formState.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  value={formState.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="pt-2">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} // Replace with your actual site key
                  onSuccess={(token) => {
                    setTurnstileToken(token)
                    setTurnstileError(null)
                  }}
                  onError={() => {
                    setTurnstileError("Failed to verify you're human. Please try again.")
                  }}
                  onExpire={() => {
                    setTurnstileToken(null)
                    setTurnstileError("Verification expired. Please complete the challenge again.")
                  }}
                  className="flex justify-center"
                />

                {turnstileError && (
                  <div className="mt-2 flex items-center text-sm text-red-500">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {turnstileError}
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
      </CardContent>

      {!isSubmitted && (
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !turnstileToken}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              "Sending..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

