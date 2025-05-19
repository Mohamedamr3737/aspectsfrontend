"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, MessageSquare, Flag, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface Comment {
  id: string
  userId: string
  reviewId: string
  content: string
  createdAt: string
  likeCount: number
  likedByMe: boolean
  flaggedByMe: boolean
  userName: string
}



interface ReviewInteractionProps {
  reviewId: number
  initialLikes: number
  initialComments: Comment[]
  className?: string
  likedByMe: boolean
  flaggedByMe: boolean
}


export default function ReviewInteraction({
  reviewId,
  initialLikes,
  initialComments,
  likedByMe,
  flaggedByMe,
  className,
}: ReviewInteractionProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(likedByMe)
  const [isReported, setIsReported] = useState(flaggedByMe)  
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reportedComments, setReportedComments] = useState<number[]>([])

  const handleLikeClick = async () => {
    setIsLiked(!isLiked)
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1))
  
    try {
      const token = localStorage.getItem("jwt")
      if (token) {
        document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
      }
  
      await fetch(`http://review.myapp.localhost/api/reviews/${reviewId}/like`, {
        method: "POST",
        credentials: "include",
      })
    } catch (err) {
      console.error("Failed to toggle like:", err)
    }
  }
  
  const handleReportClick = async () => {
    setIsReported(!isReported)
  
    try {
      const token = localStorage.getItem("jwt")
      if (token) {
        document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
      }
  
      await fetch(`http://review.myapp.localhost/api/reviews/${reviewId}/flag`, {
        method: "POST",
        credentials: "include",
      })
    } catch (err) {
      console.error("Failed to toggle flag:", err)
    }
  }

  
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
  
    setIsSubmitting(true)
  
    try {
      const token = localStorage.getItem("jwt")
      if (token) {
        document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
      }
  
      const res = await fetch(`http://comment.myapp.localhost/api/reviews/${reviewId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      })
  
      if (!res.ok) throw new Error("Failed to post comment")
  
      const newCommentData = await res.json()
      setComments((prev) => [...prev, newCommentData])
      setNewComment("")
    } catch (err) {
      console.error("Comment submit error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }
  

  const handleCommentLike = async (commentId: string) => {
    try {
      const token = localStorage.getItem("jwt")
      if (token) {
        document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
      }
  
      await fetch(`http://comment.myapp.localhost/api/comments/${commentId}/like`, {
        method: "POST",
        credentials: "include",
      })
  
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                likedByMe: !comment.likedByMe,
                likeCount: comment.likedByMe ? comment.likeCount - 1 : comment.likeCount + 1,
              }
            : comment
        )
      )
    } catch (err) {
      console.error("Failed to toggle like on comment:", err)
    }
  }
  
  const handleCommentReport = async (commentId: string) => {
    try {
      const token = localStorage.getItem("jwt")
      if (token) {
        document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
      }
  
      await fetch(`http://comment.myapp.localhost/api/comments/${commentId}/flag`, {
        method: "POST",
        credentials: "include",
      })
  
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                flaggedByMe: !comment.flaggedByMe,
              }
            : comment
        )
      )
    } catch (err) {
      console.error("Failed to toggle report on comment:", err)
    }
  }
  

  useEffect(() => {
    const fetchComments = async () => {
      if (!showComments) return

      try {
        const token = localStorage.getItem("jwt")
        if (token) {
          document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
        }

        const res = await fetch(`http://comment.myapp.localhost/api/reviews/${reviewId}/comments`, {
          credentials: "include",
        })

        if (!res.ok) throw new Error("Failed to load comments")

        const data = await res.json()
        setComments(
          data.map((comment: any) => ({
            ...comment,
            userName: comment.userName || "Anonymous",
          }))
        )
              } catch (err) {
        console.error("Failed to fetch comments:", err)
      }
    }

    fetchComments()
  }, [showComments])

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <motion.button
          className={`flex items-center gap-1 ${isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400"} hover:text-red-500 transition-colors dark-transition`}
          onClick={handleLikeClick}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div animate={isLiked ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.3 }}>
            <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500" : ""}`} />
          </motion.div>
          <span className="text-sm">{likes}</span>
        </motion.button>

        <button
          className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors dark-transition"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm">{comments.length}</span>
        </button>

        <motion.button
          className={`flex items-center gap-1 ${isReported ? "text-orange-500" : "text-gray-500 dark:text-gray-400"} hover:text-orange-500 transition-colors dark-transition`}
          onClick={handleReportClick}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={isReported ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Flag className={`h-5 w-5 ${isReported ? "fill-orange-500" : ""}`} />
          </motion.div>
          <span className="text-sm">Report</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-4 dark-transition">
              {/* Comment Form */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2 items-start mt-2">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src="/placeholder.svg?height=100&width=100" alt="Your avatar" />
                  <AvatarFallback>YO</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600 dark-transition"
                  />
                  <div className="flex justify-end mt-2">
                    <Button type="submit" size="sm" disabled={!newComment.trim() || isSubmitting} className="gap-1">
                      {isSubmitting ? "Posting..." : "Post"}
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </form>

              {/* Comments List */}
              <AnimatePresence>
                {comments.map((comment, idx) => (
                  <motion.div
                    key={comment.id}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={ "/placeholder.svg"} alt={comment.userName} />
                      <AvatarFallback>
                        {comment.userName?comment.userName:"test"
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white dark-transition">
                          {comment.userName}
                        </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400 dark-transition">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(comment.createdAt))}
                    </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 dark-transition">{comment.content}</p>
                      <div className="flex items-center gap-3 mt-1">
                      <motion.button
                        className={`flex items-center gap-1 text-xs ${comment.likedByMe ? "text-red-500" : "text-gray-500 dark:text-gray-400"} hover:text-red-500 transition-colors dark-transition`}
                        onClick={() => handleCommentLike(comment.id)}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart className={`h-3 w-3 ${comment.likedByMe ? "fill-red-500" : ""}`} />
                        <span>{comment.likeCount}</span>
                      </motion.button>

                      <motion.button
                        className={`flex items-center gap-1 text-xs ${comment.flaggedByMe ? "text-orange-500" : "text-gray-500 dark:text-gray-400"} hover:text-orange-500 transition-colors dark-transition`}
                        onClick={() => handleCommentReport(comment.id)}
                        whileTap={{ scale: 0.9 }}
                      >
                        <motion.div
                          animate={
                            comment.flaggedByMe
                              ? { scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }
                              : {}
                          }
                          transition={{ duration: 0.4 }}
                        >
                          <Flag className={`h-3 w-3 ${comment.flaggedByMe ? "fill-orange-500" : ""}`} />
                        </motion.div>
                        <span>Report</span>
                      </motion.button>

                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {comments.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-2 text-sm dark-transition">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
