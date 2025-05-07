import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { dark } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Brickscape",
  description: "From Pixels to Bricks",
  icons: {
    icon: "/brickscapeLogo.svg",
  },
};

export const viewport = {
  initialScale: 1,
  width: "device-width",
};

export const checkRole = (role) => {
  const { sessionClaims } = auth();

  return sessionClaims?.metadata.role === role;
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClerkProvider
          appearance={{
            baseTheme: dark,
          }}
        >
       
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar />
              <div className="mt-16">{children}</div>

              <Footer />
              <Toaster richColors />
            </ThemeProvider>
         
        </ClerkProvider>
      </body>
    </html>
  );
}
