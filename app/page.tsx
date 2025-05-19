"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search as SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import RestaurantCard from "@/components/restaurant-card"
import SearchSuggestions from "@/components/search-suggestions"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { useRef } from "react"

interface PlaceSummary {
  id: string
  name: string
  image?: string
  rating?: number
  cuisine?: string
  priceRange?: string
  location?: string
}

interface MostVisitedRestaurant {
  id: string
  name: string
  image?: string
  priceLevel: number
  placeId: string
  lastVisitedAt?: string
}


export default function Home() {
  useAuth(true, false)

  const RESTAURANT_API = "http://restaurant.myapp.localhost"

  const [searchValue, setSearchValue] = useState("")
  const [results, setResults] = useState<PlaceSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [trending, setTrending] = useState<MostVisitedRestaurant[]>([])
const [trendingLoading, setTrendingLoading] = useState(false)
const suggestionsRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(event.target as Node)
    ) {
      setHasSearched(false)
    }
  }

  document.addEventListener("mousedown", handleClickOutside)
  return () => {
    document.removeEventListener("mousedown", handleClickOutside)
  }
}, [])

useEffect(() => {
  const fetchTrending = async () => {
    setTrendingLoading(true)

    const attemptFetch = async () => {
      const token = localStorage.getItem("jwt")
      if (token) {
        document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
      }

      return await fetch(`${RESTAURANT_API}/places/most-visited`, {
        credentials: "include",
      })
    }

    try {
      let res = await attemptFetch()

      // If unauthorized, attempt token refresh and retry once
      if (res.status === 401) {
        const refresh = await fetch("http://auth.myapp.localhost/auth/refresh", {
          method: "POST",
          credentials: "include",
        })

        if (refresh.ok) {
          const data = await refresh.json()
          if (data.accessToken) {
            localStorage.setItem("jwt", data.accessToken)
            document.cookie = `jwt=${data.accessToken}; Domain=.myapp.localhost; Path=/;`

            res = await attemptFetch() // retry original request
          } else {
            throw new Error("No token in refresh response")
          }
        } else {
          throw new Error("Session expired. Please log in again.")
        }
      }

      if (!res.ok) throw new Error("Failed to fetch trending restaurants")

      const data = await res.json()
      setTrending(data)
    } catch (err: any) {
      toast.error(err.message || "Error loading trending restaurants")
    } finally {
      setTrendingLoading(false)
    }
  }

  fetchTrending()
}, [])




  const handleSearch = async () => {
    const query = searchValue.trim()
    if (!query) return

    setHasSearched(true)
    setLoading(true)

    const token = localStorage.getItem("jwt")
    if (token) {
      document.cookie = `jwt=${token}; Domain=.myapp.localhost; Path=/;`
    }

    try {
      // encode spaces as '+'
      const q = query.split(/\s+/).join("+")
      const res = await fetch(
        `${RESTAURANT_API}/places/search?query=${encodeURIComponent(q)}`,
        { credentials: "include" }
      )
      if (!res.ok) throw new Error(`Status ${res.status}`)

      const data: PlaceSummary[] = await res.json()
      console.log("Search API response:", data)

      setResults(data)
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch search results")
    } finally {
      setLoading(false)
    }
  }


  const categories = ["Italian","Japanese","Mexican","Indian","American","Chinese","Thai","Mediterranean"]

  return (
    <div className="min-h-screen bg-background dark:bg-background dark-transition">
      {/* Hero + Search */}
      <section className="relative bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20 pb-32 dark-transition">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Discover & Review the Best Places
          </motion.h1>
          <motion.p
            className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Find the perfect restaurant, café, or venue based on honest reviews from food enthusiasts like you.
          </motion.p>

          <motion.div
            className="relative max-w-2xl mx-auto flex items-center space-x-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Input
              type="text"
              placeholder="Search for restaurants, cuisines, or locations..."
              className="flex-1 pl-12 pr-4 py-4 rounded-full text-lg dark:bg-gray-800 dark:text-white"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading} className="p-4 rounded-full">
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l5-5-5 5h4a8 8 0 01-8 8z"/>
                </svg>
              ) : (
                <SearchIcon className="h-5 w-5" />
              )}
            </Button>
          </motion.div>

          {/* Search Results */}
          {hasSearched && (
            <div ref={suggestionsRef} className="mt-4 max-w-2xl mx-auto relative z-20">
              <SearchSuggestions searchResults={results} />
            </div>
          )}
        </div>
      </section>

    {/* Trending Restaurants */}
    <section className="py-16 bg-white dark:bg-gray-800 dark-transition">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Trending Restaurants
        </motion.h2>

        {trendingLoading ? (
          <div className="flex justify-center items-center py-10">
            <svg className="animate-spin h-6 w-6 text-gray-500 dark:text-gray-300 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l5-5-5 5h4a8 8 0 01-8 8z" />
            </svg>
            <span className="text-gray-500 dark:text-gray-300">Loading trending restaurants...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {trending.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <RestaurantCard
                  restaurant={{
                    id: r.placeId,
                    name: r.name,
                    image: r.image || "/placeholder.svg",
                    priceRange: r.priceLevel > 0 ? "$".repeat(r.priceLevel) : "",
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>

    </div>
  )
}
