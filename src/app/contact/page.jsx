
import ContactForm from "@/components/contact-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  ArrowRight,
  HelpCircle,
} from "lucide-react"

export const metadata = {
  title: "Contact Us | Inkwise AI",
  description: "Get in touch with the Inkwise AI team for support, feedback, or inquiries.",
}

export default function ContactPage() {
  return (
    <main className="bg-background min-h-screen flex flex-col items-center justify-start px-3">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl opacity-70"></div>
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium mb-4 border-primary/30">
              <MessageSquare className="h-3.5 w-3.5 mr-2 text-primary" />
              Contact Us
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">We&apos;d Love to Hear From You</h1>
            <p className="text-lg text-muted-foreground">
              Have questions about Inkwise AI? Need help with your account? Our team is here to assist you every step of
              the way.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Email Us</h3>
                      <p className="text-muted-foreground">support@inkwiseai.com</p>
                      <p className="text-sm text-muted-foreground mt-1">We&apos;ll respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Call Us</h3>
                      <p className="text-muted-foreground">+1 (555) 123-4567</p>
                      <p className="text-sm text-muted-foreground mt-1">Monday to Friday, 9AM-5PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Visit Us</h3>
                      <p className="text-muted-foreground">
                        123 Innovation Drive
                        <br />
                        Suite 400
                        <br />
                        San Francisco, CA 94103
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Business Hours</h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 5:00 PM
                        <br />
                        Saturday - Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="font-medium mb-3">Connect With Us</h3>
                  <div className="flex space-x-3">
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                    <Button variant="outline" size="icon" className="rounded-full">
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-sm border">
                <div className="flex items-center mb-4">
                  <HelpCircle className="h-5 w-5 text-primary mr-2" />
                  <h2 className="text-xl font-bold">Need Immediate Help?</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Check our comprehensive knowledge base for quick answers to common questions.
                </p>
                <Button variant="outline" className="w-full">
                  Visit Help Center
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <ContactForm />
          </div>
        </div>
      </section>

    
     
    </main>
  )
}

