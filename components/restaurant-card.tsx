"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Restaurant {
  id: number
  name: string
  image: string
  rating: number
  cuisine: string
  priceRange: string
  location: string
}

export default function RestaurantCard({
  restaurant,
}: {
  restaurant: Restaurant
}) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      variants={item}
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg group transition-all duration-200 dark-transition"
    >
      <Link href={`/restaurant/${restaurant.id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={restaurant.image || "/placeholder.svg"}
            alt={restaurant.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 rounded-full px-2 py-1 dark-transition">
            <span className="text-xs font-medium dark:text-white">{restaurant.priceRange}</span>
          </div>
        </div>
        <div className="p-4 transform group-hover:translate-y-[-5px] transition-transform duration-200">
          <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white dark-transition">{restaurant.name}</h3>
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 dark-transition">
            <span>{restaurant.cuisine}</span>
            <span>{restaurant.location}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
