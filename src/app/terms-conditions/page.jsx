
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata= {
  title: "Terms & Conditions | Brickscape",
  description: "Terms & Conditions for using Brickscape - Your Real Estate Marketplace",
}

export default function TermsAndConditions() {
  return (
    <div className="container  py-12 px-4 md:px-6">
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
          <CardTitle className="text-3xl font-bold">Terms & Conditions</CardTitle>
          <CardDescription>Effective Date: 9 May 2025 | Last Updated: 9 May 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm md:text-base">
          <div>
            <p className="mb-4">Welcome to Brickscape! By using our platform, you agree to these Terms & Conditions.</p>
          </div>

          <section>
            <h3 className="text-xl font-semibold mb-2">1. Use of Service</h3>
            <Separator className="mb-3" />
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be 18+ to post properties.</li>
              <li>You agree to provide accurate and lawful property information.</li>
              <li>We reserve the right to moderate or remove any listing.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">2. Intellectual Property</h3>
            <Separator className="mb-3" />
            <ul className="list-disc pl-6 space-y-2">
              <li>All content, logos, and branding are owned by Brickscape.</li>
              <li>Do not copy or reuse without permission.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">3. User Conduct</h3>
            <Separator className="mb-3" />
            <ul className="list-disc pl-6 space-y-2">
              <li>Do not post fake, misleading, or duplicate listings.</li>
              <li>Do not impersonate other users or agents.</li>
              <li>Do not upload offensive, illegal, or copyrighted material.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">4. Liability Disclaimer</h3>
            <Separator className="mb-3" />
            <ul className="list-disc pl-6 space-y-2">
              <li>Brickscape does not guarantee the legal status of any property listed.</li>
              <li>We are not responsible for disputes between buyers, sellers, or agents.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">5. Changes to the Site</h3>
            <Separator className="mb-3" />
            <p>We may change or suspend parts of the site without prior notice.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">6. Termination</h3>
            <Separator className="mb-3" />
            <p>We reserve the right to terminate accounts that violate our terms.</p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2">7. Contact Information</h3>
            <Separator className="mb-3" />
            <p>If you have any questions about these Terms & Conditions, please contact us:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Email: support@brickscape.pk</li>
              <li>
                Website:{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact Page
                </Link>
              </li>
            </ul>
          </section>

          <div className="mt-6 pt-6 border-t text-sm text-muted-foreground">
            <p>
              By using Brickscape, you acknowledge that you have read, understood, and agree to be bound by these Terms
              & Conditions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
