"use client"

import { motion } from "framer-motion"
import { Search } from "lucide-react"
import Link from "next/link"

interface PlaceSuggestion {
  name: string
  address: string
  placeId: string
}

export default function SearchSuggestions({
  searchResults,
}: {
  searchResults: PlaceSuggestion[]
}) {
  // Show every result returned from the API
  const filteredRestaurants = searchResults

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-[9999] overflow-hidden dark-transition"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="max-h-[70vh] overflow-y-auto p-4">
        {filteredRestaurants.length > 0 ? (
          <>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 dark-transition">
              Restaurants
            </h4>
            {filteredRestaurants.map((place) => (
              <motion.div key={place.placeId} variants={item} className="py-2">
                <Link
                  href={`/restaurant/${place.placeId}`}
                  className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-md transition-colors dark-transition"
                >
                  <Search className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-gray-900 dark:text-white dark-transition text-lg truncate">
                      {place.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm dark-transition truncate">
                      {place.address}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </>
        ) : (
          <motion.div
            variants={item}
            className="py-4 text-center text-gray-500 dark:text-gray-400 dark-transition"
          >
            No results found.
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
