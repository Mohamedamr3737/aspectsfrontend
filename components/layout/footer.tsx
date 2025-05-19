"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t dark:border-gray-800 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.div
            className="text-lg font-bold text-primary"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            CeView
          </motion.div>

          <nav className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="#" className="hover:text-primary">About</Link>
            <Link href="#" className="hover:text-primary">Contact</Link>
            <Link href="#" className="hover:text-primary">Privacy</Link>
          </nav>

          <div className="flex gap-3">
            <Link href="#" className="hover:text-primary" aria-label="Twitter">
              <Twitter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <Link href="#" className="hover:text-primary" aria-label="Facebook">
              <Facebook className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <Link href="#" className="hover:text-primary" aria-label="Instagram">
              <Instagram className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-600">
          © {new Date().getFullYear()} CeView. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
