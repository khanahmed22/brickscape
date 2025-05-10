import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata = {
  title: "Privacy Policy | Brickscape",
  description: "Privacy Policy for Brickscape - Your Real Estate Marketplace",
}

export default function PrivacyPolicy() {
  return (
    <div className=" container  py-12 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
 
      <Card >
        <CardHeader className="text-center">
          <CardTitle className="text-3xl max-md:text-xl font-bold">Privacy Policy</CardTitle>
          <CardDescription className="max-md:text-lg">Effective Date: 9 May 2025 | Last Updated: 9 May 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base">
          <div>
            <p className="mb-4">
              At Brickscape, we value your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website.
            </p>
          </div>

          <section>
            <h3 className="text-xl font-semibold mb-2">1. Information We Collect</h3>
            <Separator className="mb-3" />
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal details like name, email, phone number, and optionally CNIC.</li>
              <li>Property details you submit.</li>
              <li>Technical data such as your IP address, browser type, and device info.</li>
              <li>Usage data including how you interact with our platform.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">2. How We Use Your Information</h3>
            <Separator className="mb-3" />
            <ul className="list-disc pl-6 space-y-2">
              <li>To allow you to post, view, and manage property listings.</li>
              <li>To verify, moderate, or enhance your listings.</li>
              <li>To improve site functionality and user experience.</li>
              <li>To send you service-related or promotional emails (you may opt out).</li>
              <li>To analyze usage patterns and optimize our services.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">3. Sharing of Information</h3>
            <Separator className="mb-3" />
            <ul className="list-disc pl-6 space-y-2">
              <li>We do not sell your personal data to third parties.</li>
              <li>We may share data with trusted third parties (e.g., map APIs, payment processors) who help us provide our services.</li>
              <li>We may disclose information if required by law or to protect our rights or the safety of users.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">4. Security Measures</h3>
            <Separator className="mb-3" />
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">5. Your Rights</h3>
            <Separator className="mb-3" />
            <ul className="list-disc pl-6 space-y-2">
              <li>You have the right to access, update, or delete your personal data.</li>
              <li>You can request account deletion at any time.</li>
              <li>You may opt out of marketing communications while still receiving essential service notifications.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">6. Cookies</h3>
            <Separator className="mb-3" />
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, and assist in our marketing efforts. You can control cookies through your browser settings, although this may affect some functionality.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">7. Changes to This Policy</h3>
            <Separator className="mb-3" />
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">8. Contact Us</h3>
            <Separator className="mb-3" />
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Email: support@brickscape.pk</li>
              <li>Website: <Link href="/contact" className="text-primary hover:underline">Contact Page</Link></li>
            </ul>
          </section>
        </CardContent>
      </Card>
    
    </div>
  )
}
