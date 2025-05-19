"use client"

import { useState } from "react"
import { toast, Toaster } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Facebook, Github, Mail, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const AUTH_API = "http://auth.myapp.localhost/auth"

export default function LoginPage() {
  /* ────────── state ────────── */
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  /* ────────── helpers ────────── */
  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  async function jsonOrText(res: Response) {
    try {
      return await res.clone().json()     // clone so body can be read twice safely
    } catch {
      return await res.text()
    }
  }

  /* ────────── API calls ────────── */
  const handleLogin = async () => {
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;
    const staySignedIn = (document.getElementById("remember-me") as HTMLInputElement)?.checked ?? false;
  
    try {
      setLoading(true);
  
      const res = await fetch(`${AUTH_API}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, staySignedIn }),
      });
  
      const data = await jsonOrText(res);
  
      if (res.ok) {
        // ✅ Store token in localStorage
        if (typeof data === "object" && "accessToken" in data) {
          localStorage.setItem("jwt", data.accessToken);
        }
  
        toast.success("Logged in ✔");
        window.location.href='/'      
} else {
        toast.error(
          typeof data === "string" ? data : data.message ?? "Login failed"
        );
      }
    } catch (e: any) {
      toast.error(e.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  };
  

  const handleSignup = async () => {
    const name = (document.getElementById("signup-name") as HTMLInputElement).value
    const email = (document.getElementById("signup-email") as HTMLInputElement).value
    const password = (document.getElementById("signup-password") as HTMLInputElement).value

    try {
      setLoading(true)

      const res = await fetch(`${AUTH_API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      if (res.ok) {
        toast.success("Account created 🎉")
        setActiveTab("login")
      } else {
        const err = await jsonOrText(res)
        toast.error(
          typeof err === "string" ? err : err.message ?? "Signup failed",
          { description: `Status ${res.status}` }
        )
      }
    } catch (e: any) {
      toast.error(e.message ?? "Network error")
    } finally {
      setLoading(false)
    }
  }

  /* ────────── animations (unchanged) ────────── */
  const formVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  }
  const tabVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  }
  const getDirection = () => (activeTab === "login" ? -1 : 1)

  /* ────────── JSX ────────── */
  return (
    <>
      {/* global toaster for this page */}
      <Toaster richColors position="top-center" />

      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <div className="p-8">
            {/* header */}
            <div className="text-center mb-8">
              <motion.h1
                className="text-3xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Welcome to CeView
              </motion.h1>
              <motion.p
                className="mt-2 text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Discover and review the best places to eat
              </motion.p>
            </div>

            {/* tab switcher */}
            <Tabs defaultValue="login" value={activeTab} onValueChange={v => setActiveTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" custom={getDirection()}>
                  <motion.div
                    key={activeTab}
                    custom={getDirection()}
                    variants={tabVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {activeTab === "login" ? (
                      /* ────────── LOGIN FORM ────────── */
                      <div className="space-y-4">
                        {/* email */}
                        <motion.div className="space-y-2" custom={0} variants={formVariants} initial="hidden" animate="visible">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="Enter your email" />
                        </motion.div>
                        {/* password */}
                        <motion.div className="space-y-2" custom={1} variants={formVariants} initial="hidden" animate="visible">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </motion.div>
                        {/* remember & link */}
                        <motion.div
                          className="flex items-center justify-between"
                          custom={2}
                          variants={formVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <div className="flex items-center">
                            <input id="remember-me" type="checkbox" className="h-4 w-4" />
                            <label htmlFor="remember-me" className="ml-2 text-sm">
                              Remember me
                            </label>
                          </div>
                          <Link href="#" className="text-sm font-medium text-primary hover:underline">
                            Forgot password?
                          </Link>
                        </motion.div>
                        {/* submit */}
                        <motion.div custom={3} variants={formVariants} initial="hidden" animate="visible">
                          <Button className="w-full" onClick={handleLogin} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
                          </Button>
                        </motion.div>
                      </div>
                    ) : (
                      /* ────────── SIGN-UP FORM ────────── */
                      <div className="space-y-4">
                        {/* name */}
                        <motion.div className="space-y-2" custom={0} variants={formVariants} initial="hidden" animate="visible">
                          <Label htmlFor="signup-name">Full Name</Label>
                          <Input id="signup-name" type="text" placeholder="Enter your full name" />
                        </motion.div>
                        {/* email */}
                        <motion.div className="space-y-2" custom={1} variants={formVariants} initial="hidden" animate="visible">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input id="signup-email" type="email" placeholder="Enter your email" />
                        </motion.div>
                        {/* password */}
                        <motion.div className="space-y-2" custom={2} variants={formVariants} initial="hidden" animate="visible">
                          <Label htmlFor="signup-password">Password</Label>
                          <div className="relative">
                            <Input
                              id="signup-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </motion.div>
                        {/* confirm */}
                        <motion.div className="space-y-2" custom={3} variants={formVariants} initial="hidden" animate="visible">
                          <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                          <Input id="signup-confirm-password" type="password" placeholder="Confirm your password" />
                        </motion.div>
                        {/* submit */}
                        <motion.div custom={4} variants={formVariants} initial="hidden" animate="visible">
                          <Button className="w-full" onClick={handleSignup} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
                          </Button>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* social buttons */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>
                <motion.div
                  className="mt-6 grid grid-cols-3 gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <Button variant="outline">
                    <Facebook className="h-5 w-5" />
                  </Button>
                  <Button variant="outline">
                    <Github className="h-5 w-5" />
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-5 w-5" />
                  </Button>
                </motion.div>
              </div>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </>
  )
}
