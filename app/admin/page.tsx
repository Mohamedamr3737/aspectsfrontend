"use client"

import { useEffect, useState } from "react"
import { Moon, Sun, Trash2 } from "lucide-react"
import { ThemeProvider, useTheme } from "next-themes"
import "@/app/globals.css"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/useAuth"

export interface ReviewResponseDto {
    id: string
    content: string
    flagReason: string // or 'reason', based on your service
    createdAt: string
  }
  

function AdminPanelContent() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(false)
    
    useEffect(() => {
      const fetchFlaggedReviews = async () => {
        setLoading(true)
        try {
          const token = localStorage.getItem("jwt")
          if (token) {
            document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
          }
    
          const res = await fetch("http://review.myapp.localhost/api/admin/reviews/spam", {
            credentials: "include",
          })

    
          if (!res.ok) throw new Error("Failed to fetch flagged reviews")
    
          const data = await res.json()
          console.log(data)
          setReviews(data)
        } catch (err: any) {
          console.error("Error:", err)
        } finally {
          setLoading(false)
        }
      }
    
      fetchFlaggedReviews()
    }, [])
      const { theme, setTheme } = useTheme()

      const handleDeleteReview = async (id: string) => {
        try {
          const token = localStorage.getItem("jwt")
          if (token) {
            document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
          }
      
          const res = await fetch(`http://review.myapp.localhost/api/reviews/${id}/flagged`, {
            method: "DELETE",
            credentials: "include",
          })
      
          if (!res.ok) throw new Error("Failed to delete flagged review")
      
          setReviews((prev) => prev.filter((r) => r.id !== id))
        } catch (err: any) {
          console.error("Delete failed:", err)
        }
      }
      

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Flagged Reviews</h2>
          <p className="text-muted-foreground mt-2">Manage reviews that have been flagged for inappropriate content.</p>
        </div>

        <div className="grid gap-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-end">
                  <Badge variant="destructive">
                {review.flagReason || "Flagged"}
                </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{review.content}</p>
                </CardContent>
                <Separator />
                <CardFooter className="flex justify-between pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Review
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the review from the database.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteReview(review.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <div className="mx-auto max-w-md">
                <h3 className="text-xl font-semibold">No Flagged Reviews</h3>
                <p className="text-muted-foreground mt-2">
                  There are currently no reviews flagged for review. Check back later.
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function AdminPanel() {
    useAuth(true, true)
    
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AdminPanelContent />
    </ThemeProvider>
  )
}
