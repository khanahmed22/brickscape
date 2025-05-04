'use client'
import { createClient } from "@supabase/supabase-js"


const supabaseClients = new Map()
let guestClient = null

export default function getSupabaseClient(token = null) {
  
  if (!token) {
    
    if (!guestClient) {
   
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase environment variables")
      }

 
      guestClient = createClient(supabaseUrl, supabaseKey)
    }

    return guestClient
  }

 
  if (!supabaseClients.has(token)) {
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables")
    }

  
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

    supabaseClients.set(token, client)
  }


  return supabaseClients.get(token)
}

