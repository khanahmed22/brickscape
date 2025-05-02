import { NextRequest, NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, subject, message, turnstileToken } = body

    // Validate form data
    if (!name || !email || !subject || !message || !turnstileToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify Turnstile token
    const verificationResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    })

    const verification = await verificationResponse.json()

    if (!verification.success) {
      return NextResponse.json({ error: "Turnstile verification failed" }, { status: 400 })
    }

    // Process the contact form submission
    // This is where you would typically:
    // 1. Send an email notification
    // 2. Store the message in a database
    // 3. Integrate with a CRM or ticketing system

    // For this example, we'll just return a success response
    return NextResponse.json({ success: true, message: "Contact form submitted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

