"use client"

import { useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import Image from "next/image"
import { Star, MapPin, Clock, Phone, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import ReviewInteraction from "@/components/review-interaction"
import { useEffect } from "react"
import { features } from "process"
import { use } from "react"
import { toast } from "sonner"
import { da } from "date-fns/locale"
import { useAuth } from "@/hooks/useAuth"



export default function RestaurantDetails({ params }: { params: Promise<{ id: string }> }) {
  useAuth(true, false)
  
  const { id } = use(params)

  const [showWriteReview, setShowWriteReview] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [userRating, setUserRating] = useState(0)
  const [expandedComments, setExpandedComments] = useState<number[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])

  const headerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0.3])
  const headerScale = useTransform(scrollY, [0, 200], [1, 1.1])

  const toggleComments = (reviewId: number) => {
    setExpandedComments((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId],
    )
  }

  const handleRatingClick = (rating: number) => {
    setUserRating(rating)
  }

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite)
  }


const [restaurant, setRestaurant] = useState<any>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)



useEffect(() => {
  const fetchRestaurant = async () => {

    const token = localStorage.getItem("jwt")
    if (token) {
      document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
    }
    try {
      const response = await fetch(
        `http://restaurant.myapp.localhost/places/details?placeId=${id}`,
        {
          credentials: "include",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to fetch restaurant data")
      }

      const data = await response.json()

      const formattedData = {
        id: data.placeId,
        name: data.name,
        image: data.imageUrl || "/placeholder.svg",
        rating: data.rating || 0,
        // reviewCount: restaurant.reviewCount, // keep mock review count
        cuisine: data.types[0] || "Restaurant",
        types:data.types,
        priceRange: "$$",
        location: data.address,
        hours: parseTodayHours(data.openingHours),
        phone: data.phone,
        website: "https://example.com",
        description: `${data.name} is a popular restaurant located in ${data.address}. Visit us to enjoy an exceptional dining experience.`,
        // reviews: restaurant.reviews,
        latitude: data.latitude,
        longitude: data.longitude,
        openingHours: data.openingHours,
      }
      setRestaurant(formattedData)
      await loadReviews()

    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  fetchRestaurant()
}, [id])


function parseTodayHours(hours: string[]) {
  if (!hours || hours.length === 0) return "Hours not available"
  const today = new Date().getDay()
  const index = today === 0 ? 6 : today - 1
  return hours[index]?.split(": ")[1] || "Hours not available"
}

const handleSubmitReview = async () => {
  const token = localStorage.getItem("jwt")
  if (token) {
    document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
  }
  try {
    const token = localStorage.getItem("jwt")
    if (!token) {
      toast.error("Please log in to submit a review.")
      return
    }

    const payload = {
      restaurantId: id,
      rating: userRating,
      content: reviewText.trim(),
    }

    const response = await fetch("http://review.myapp.localhost/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Failed to submit review")
    }

    toast.success("Your review was submitted successfully!")
    
    setReviewText("")
    setUserRating(0)
    setShowWriteReview(false)
    await loadReviews()

  } catch (error: any) {
    toast.error(error.message || "Something went wrong.")
  }
}

const loadReviews = async () => {
  try {
    const token = localStorage.getItem("jwt")
    if (token) {
      document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
    }

    const res = await fetch(`http://review.myapp.localhost/api/restaurants/${id}/reviews`, {
      credentials: "include",
    })

    if (!res.ok) throw new Error("Failed to load reviews")

    const reviews = await res.json()

    // For each review, fetch its comments
    const reviewsWithComments = await Promise.all(
      reviews.map(async (review: any) => {
        try {
          const commentRes = await fetch(`http://comment.myapp.localhost/api/reviews/${review.id}/comments`, {
            credentials: "include",
          })

          const comments = commentRes.ok ? await commentRes.json() : []

          return {
            ...review,
            comments,
          }
        } catch (err) {
          console.error(`Failed to fetch comments for review ${review.id}`, err)
          return {
            ...review,
            comments: [],
          }
        }
      })
    )

    setReviews(reviewsWithComments)
  } catch (err) {
    console.error("Review fetch error:", err)
  }
}





if (loading) {
  return <div className="p-8 text-center">Loading restaurant...</div>
}

if (error) {
  return <div className="p-8 text-center text-red-600">Error: {error}</div>
}

const data = restaurant


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark-transition">
      {/* Header with Parallax Effect */}
      <motion.div ref={headerRef} className="relative h-[50vh] overflow-hidden" style={{ opacity: headerOpacity }}>
        <motion.div className="absolute inset-0" style={{ scale: headerScale }}>
          <Image
            src={data.image || "/placeholder.svg"}
            alt={data.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Badge className="mb-3">{data.cuisine}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{data.name}</h1>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.floor(data.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 font-medium">{data.rating}</span>
              </div>
              {/* <span className="text-gray-200">({restaurantData.reviewCount} reviews)</span> */}
            </div>
            <div className="flex items-center text-gray-200">
              <MapPin className="h-4 w-4 mr-1" />
              {data.location}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 dark-transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white dark-transition">About</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6 dark-transition">{data.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {data.types.map((feature) => (
                  <Badge
                    key={feature}
                    variant="outline"
                    className="dark:border-gray-600 dark:text-gray-300 dark-transition"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>

              <Separator className="my-6 dark:bg-gray-700" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white dark-transition">Hours</h3>
                    <p className="text-gray-600 dark:text-gray-400 dark-transition">{data.hours}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white dark-transition">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-400 dark-transition">{data.phone}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Globe className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white dark-transition">Website</h3>
                    <a
                      href={data.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visit website
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Reviews Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white dark-transition">
                  {/* Reviews ({data.reviewCount}) */}
                </h2>
                <Button onClick={() => setShowWriteReview(!showWriteReview)} className="gap-2">
                  {showWriteReview ? "Cancel" : "Write a Review"}
                </Button>
              </div>

              {/* Write Review Form */}
              <AnimatedReviewForm
                showWriteReview={showWriteReview}
                userRating={userRating}
                reviewText={reviewText}
                setReviewText={setReviewText}
                handleRatingClick={handleRatingClick}
                onSubmit={handleSubmitReview}
              />


              {/* Reviews List */}
              <div className="space-y-6">
  {reviews.length === 0 ? (
    <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first!</p>
  ) : (
    reviews.map((review: any, index) => (
      <motion.div
        key={review.id}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 dark-transition"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <div className="flex items-start">
          <Avatar className="h-10 w-10 mr-4">
            <AvatarImage src={"/placeholder.svg"} alt={review.userName || "User"} />
            <AvatarFallback>
              {(review.userName || "U").split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white dark-transition">
                {review.userName || "Anonymous"}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400 dark-transition">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center mt-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              ))}
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 dark-transition">{review.content}</p>
            <ReviewInteraction
              reviewId={review.id}
              initialLikes={review.likeCount || 0}
              initialComments={review.comments || []}
              likedByMe={review.likedByMe}
              flaggedByMe={review.flaggedByMe}
            />

          </div>
        </div>
      </motion.div>
    ))
  )}
</div>

            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-20 dark-transition"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white dark-transition">Location</h2>
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden dark-transition">
                {/* Placeholder for map */}
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 dark-transition">
                  Map View
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-6 dark-transition">
              <iframe 
  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAKyld7vKKDJqqz8slivvpQMCIP75pfwVs&q=${data.latitude},${data.longitude}&zoom=16`}
          ></iframe>

              </p>

              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white dark-transition">Hours</h2>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300 dark-transition">Monday - Friday</span>
                  <span className="text-gray-900 dark:text-white dark-transition">11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300 dark-transition">Saturday</span>
                  <span className="text-gray-900 dark:text-white dark-transition">10:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 dark:text-gray-300 dark-transition">Sunday</span>
                  <span className="text-gray-900 dark:text-white dark-transition">10:00 AM - 9:00 PM</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnimatedReviewForm({
  showWriteReview,
  userRating,
  reviewText,
  setReviewText,
  handleRatingClick,
  onSubmit,
}: {
  showWriteReview: boolean
  userRating: number
  reviewText: string
  setReviewText: (text: string) => void
  handleRatingClick: (rating: number) => void
  onSubmit: () => void
}) {

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 dark-transition"
      initial={{ height: 0, opacity: 0 }}
      animate={{
        height: showWriteReview ? "auto" : 0,
        opacity: showWriteReview ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
      style={{ overflow: "hidden" }}
    >
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white dark-transition">Write a Review</h3>

      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2 dark-transition">Your Rating</label>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleRatingClick(star)}
              className="mr-1"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= userRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                }`}
              />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="review-text" className="block text-gray-700 dark:text-gray-300 mb-2 dark-transition">
          Your Review
        </label>
        <Textarea
          id="review-text"
          placeholder="Share your experience with this restaurant..."
          rows={5}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600 dark-transition"
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={userRating === 0 || reviewText.trim() === ""}
        >
          Submit Review
        </Button>
      </div>

    </motion.div>
  )
}
