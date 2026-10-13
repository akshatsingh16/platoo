"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { getRestaurants } from "@/lib/api"
import type { RestaurantResponse } from "@/lib/types"

interface RestaurantContextType {
  restaurant: RestaurantResponse | null
  restaurants: RestaurantResponse[]
  loading: boolean
  error: string | null
  selectRestaurant: (r: RestaurantResponse) => void
  refresh: () => Promise<void>
}

const RestaurantContext = createContext<RestaurantContextType>({
  restaurant: null,
  restaurants: [],
  loading: true,
  error: null,
  selectRestaurant: () => {},
  refresh: async () => {},
})

export function useRestaurant() {
  return useContext(RestaurantContext)
}

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null)
  const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRestaurants = async () => {
    try {
      setLoading(true)
      setError(null)
      const page = await getRestaurants(0, 50)
      setRestaurants(page.content)
      // Auto-select first restaurant if none selected
      if (!restaurant && page.content.length > 0) {
        setRestaurant(page.content[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load restaurants")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        restaurants,
        loading,
        error,
        selectRestaurant: setRestaurant,
        refresh: fetchRestaurants,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  )
}
