"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X } from "lucide-react"
import { jwtDecode } from "jwt-decode" // install via: npm i jwt-decode
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface DecodedToken {
  role?: string
  [key: string]: any
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)

    // Check token on mount
    const token = localStorage.getItem("jwt")
    if (token) {
      setIsLoggedIn(true)
      try {
        const decoded = jwtDecode<DecodedToken>(token)
        console.log("User role:", decoded?.role)  // 👈 Log role here

        setIsAdmin(decoded?.role === "admin")
      } catch {
        setIsAdmin(false)
      }
    }

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("jwt")
    setIsLoggedIn(false)
    setIsAdmin(false)
    router.replace("/")
    window.location.reload()
  }

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 dark-transition ${
        isScrolled ? "bg-white dark:bg-gray-900 shadow-md" : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <motion.div
            className="text-2xl font-bold text-primary"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            CeView
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavLink href="/">Home</NavLink>
          {isAdmin && <NavLink href="/admin">Admin Panel</NavLink>}
          <ThemeToggle />
          {isLoggedIn ? (
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button asChild size="sm" className="ml-2">
              <Link href="/login">Login / Signup</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center md:hidden gap-2">
          <ThemeToggle />
          <motion.button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} whileTap={{ scale: 0.95 }}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden bg-white dark:bg-gray-900 dark-transition"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </MobileNavLink>
            {isAdmin && (
              <MobileNavLink href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                Admin Panel
              </MobileNavLink>
            )}
            {isLoggedIn ? (
              <Button size="sm" className="w-full" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <Button asChild size="sm" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <Link href="/login">Login / Signup</Link>
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative group">
      <span className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors duration-300">
        {children}
      </span>
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
    </Link>
  )
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors duration-300 py-2 block"
      onClick={onClick}
    >
      {children}
    </Link>
  )
}
