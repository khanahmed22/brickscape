// supabase-context.js
"use client"; // This makes the component a client-side component

import { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useSession } from '@clerk/nextjs';
import getSupabaseClient from './supabase';

const SupabaseContext = createContext();

export const SupabaseProvider = ({ children }) => {
  const { user } = useUser();
  const { session } = useSession();
  const [countData, setCountData] = useState([]);
  const email = user?.primaryEmailAddress?.emailAddress || '';

  useEffect(() => {
    if (!user || !session) return;

    async function loadOrCreateUserData() {
      const clerkToken = await session.getToken({ template: 'supabase' });
      const client = getSupabaseClient(clerkToken);

      const { data, error } = await client
        .from('ai_table')
        .select()
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }

      if (data.length === 0) {
        const { error: insertError } = await client
          .from('ai_table')
          .insert({
            email: email,
            count: 25,
          });

        if (insertError) {
          console.error('Error inserting user data:', insertError);
          return;
        }
      }

      setCountData(data);
    }

    loadOrCreateUserData();
  }, [user, session]);

  return (
    <SupabaseContext.Provider value={{ countData, setCountData }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabaseData = () => useContext(SupabaseContext);
