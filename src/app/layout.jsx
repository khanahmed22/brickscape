import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { SupabaseProvider } from "./utils/SupabaseContext";

import { auth } from "@clerk/nextjs/server";
import { dark } from "@clerk/themes";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "InkWise AI",
  description:"Unleash your creativity with Inkwise AI",
  icons: {
    icon: "/inkwiselogo.svg", 
  },
};

export const viewport  = {
  initialScale: 1,
  width: 'device-width'
}

export const checkRole = (role) => {
  const { sessionClaims } = auth();

  return sessionClaims?.metadata.role === role;
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider appearance={{
        baseTheme: dark,
      }}>
        <SupabaseProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
       
          <Navbar/>
           <div className="mt-16">
            {children}
           </div>
           
           
          
            
            <Footer />
            <Toaster richColors />
          </ThemeProvider>
          </SupabaseProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
