"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"

export default function NotAuthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md space-y-6"
      >
        <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">
          You don't have permission to view this page. Please contact an administrator if you believe this is a mistake.
        </p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </motion.div>
    </main>
  )
}
