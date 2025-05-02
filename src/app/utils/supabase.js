'use client'
import { createClient } from "@supabase/supabase-js"

// Store clients by token to support multiple users/tokens
const supabaseClients = new Map()
let guestClient = null

export default function getSupabaseClient(token = null) {
  // Check if we're in guest mode (no token provided)
  if (!token) {
    // Create guest client if it doesn't exist yet
    if (!guestClient) {
      // Validate environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase environment variables")
      }

      // Create a guest client with no auth token
      guestClient = createClient(supabaseUrl, supabaseKey)
    }

    // Return the guest client
    return guestClient
  }

  // For authenticated users, continue with the existing logic
  if (!supabaseClients.has(token)) {
    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables")
    }

    // Create a new client for this token
    const client = createClient(supabaseUrl, supabaseKey, {
      global: {
        fetch: async (url, options = {}) => {
          const headers = new Headers(options?.headers)
          headers.set("Authorization", `Bearer ${token}`)
          return fetch(url, {
            ...options,
            headers,
          })
        },
      },
    })

    // Store the client for future use
    supabaseClients.set(token, client)
  }

  // Return the client for this token
  return supabaseClients.get(token)
}

