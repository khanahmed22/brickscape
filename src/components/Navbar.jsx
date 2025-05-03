"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "./ThemeToggle";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = (path) => pathname === path;

  const router = useRouter()

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md shadow-sm h-16"
          : "bg-background h-20"
      }`}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-x-2 z-50"
          prefetch={false}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-x-2"
          >
            <img src="/brickscapeLogo.svg" alt="brickscape Logo" className="w-[36px] h-[36px]" />
            <span className="font-bold text-xl text-primary hidden sm:inline-block">
              Brickscape
            </span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-x-1">
          <NavLink href="/" active={isActive("/")}>
            Home
          </NavLink>

          

          <NavLink href="/gallery" active={isActive("/gallery")}>
            Gallery
          </NavLink>

          <NavLink href="/pricing" active={isActive("/pricing")}>
            Pricing
          </NavLink>

          <NavLink href="/contact" active={isActive("/contact")}>
            Contact
          </NavLink>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-x-5">
          <ModeToggle />

          <SignedIn>
            <Button onClick={()=>router.push("/dashboard")}>Dashboard</Button>
          </SignedIn>

          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </SignedIn>
          

          <SignedOut>
            <Link href="/sign-in" prefetch={false} className="hidden lg:block">
              <Button variant="ghost" size="sm" className="mr-2">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up" prefetch={false} className="hidden lg:block">
              <Button size="sm" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Get Started
              </Button>
            </Link>
          </SignedOut>

          {/* Mobile Menu Trigger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px] pr-0">
              <div className="px-2 py-6 flex flex-col h-full">
                <div className="mb-4 flex items-center">
                  <img
                    src="/brickscapeLogo.svg"
                    alt="Brickscape Logo"
                    className="w-[32px] h-[32px] mr-2"
                  />
                  <span className="font-bold text-lg text-primary">
                    Brickscape
                  </span>
                </div>

                <nav className="flex flex-col space-y-4">
                  <MobileNavLink href="/" active={isActive("/")}>
                    Home
                  </MobileNavLink>

                  <SignedIn>
                    <MobileNavLink
                      href="/dashboard"
                      active={isActive("/dashboard")}
                    >
                      Dashboard
                    </MobileNavLink>
                  </SignedIn>

                  <MobileNavLink
                    href="/gallery"
                    active={isActive("/dashboard")}
                  >
                    Gallery
                  </MobileNavLink>

                  <MobileNavLink href="/pricing" active={isActive("/pricing")}>
                    Pricing
                  </MobileNavLink>

                  <MobileNavLink href="/contact" active={isActive("/contact")}>
                    Contact
                  </MobileNavLink>
                </nav>

                <div className="mt-auto pt-4 border-t">
                  <SignedOut>
                    <div className="grid gap-2">
                      <Link href="/sign-in" prefetch={false} className="w-full">
                        <Button
                          variant="outline"
                          className="w-full justify-center"
                        >
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up" prefetch={false} className="w-full">
                        <Button className="w-full justify-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5" />
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </SignedOut>

                  <SignedIn>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Signed in as:
                      </span>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </SignedIn>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

// Desktop Navigation Link
function NavLink({ href, active, children }) {
  return (
    <Link href={href} prefetch={false}>
      <Button
        variant="ghost"
        className={`relative px-4 py-2 h-9 ${active ? "text-primary" : ""}`}
      >
        {children}
        {active && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full mx-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </Button>
    </Link>
  );
}

// Mobile Navigation Link
function MobileNavLink({ href, active, children, indent = false }) {
  return (
    <Link
      href={href}
      className={`flex items-center py-2 px-3 ${
        indent ? "ml-4" : ""
      } rounded-md text-base ${
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:bg-muted/50 transition-colors"
      }`}
      prefetch={false}
    >
      {children}
    </Link>
  );
}
