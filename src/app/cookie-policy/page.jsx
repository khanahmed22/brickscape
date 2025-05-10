import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Cookie Policy | Brickscape",
  description: "Cookie Policy for Brickscape - Learn how we use cookies on our website",
}

export default function CookiePolicy() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Cookie Policy</CardTitle>
          <CardDescription>Effective Date: 9 May 2025 | Last Updated: 9 May 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base">
          <div>
            <p className="mb-4">
              This Cookie Policy explains how Brickscape ("we", "our", or "us") uses cookies and similar technologies to
              recognize you when you visit our website.
            </p>
          </div>

          <section>
            <h3 className="text-xl font-semibold mb-2">1. What Are Cookies?</h3>
            <Separator className="mb-3" />
            <p>
              Cookies are small text files stored on your device when you visit a website. They help websites remember
              your actions and preferences (such as login, language, or display settings).
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">2. How We Use Cookies</h3>
            <Separator className="mb-3" />
            <p>We use cookies to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Enable essential website functionality.</li>
              <li>Remember your login status and preferences.</li>
              <li>Analyze site traffic and user behavior to improve our service.</li>
              <li>Deliver personalized content and ads (if applicable).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">3. Types of Cookies We Use</h3>
            <Separator className="mb-3" />
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <span className="font-medium">Essential Cookies:</span> Required for basic site functionality (e.g.,
                login, navigation).
              </li>
              <li>
                <span className="font-medium">Performance Cookies:</span> Help us analyze how users interact with the
                site (e.g., Google Analytics).
              </li>
              <li>
                <span className="font-medium">Functionality Cookies:</span> Remember your choices and settings.
              </li>
              <li>
                <span className="font-medium">Advertising Cookies (if enabled):</span> Used by third parties like Google
                AdSense to show relevant ads.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">4. Managing Cookies</h3>
            <Separator className="mb-3" />
            <p>You can control and/or delete cookies as you wish:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Adjust your browser settings to block or delete cookies.</li>
              <li>Be aware that disabling cookies may affect site functionality.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">5. Third-Party Cookies</h3>
            <Separator className="mb-3" />
            <p>
              We may allow trusted third parties (like Google or Facebook) to place cookies to serve ads or provide
              analytics.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">6. Updates to This Policy</h3>
            <Separator className="mb-3" />
            <p>We may update this policy from time to time. We recommend checking this page regularly for changes.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">7. Contact Us</h3>
            <Separator className="mb-3" />
            <p>If you have any questions about this Cookie Policy, contact us at:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Email: support@brickscape.pk</li>
              <li>
                Website:{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  https://brickscape.pk/contact
                </Link>
              </li>
            </ul>
          </section>

          <div className="mt-6 pt-6 border-t text-sm text-muted-foreground">
            <p>
              By continuing to use our website, you acknowledge that you have read and understood this Cookie Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
