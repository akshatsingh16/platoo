"use client"

import { useEffect, useState } from "react"

import {
  ArrowRight,
  Check,
  ClipboardList,
  CookingPot,
  Heart,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// ============================================================
// DATA
// ============================================================

const recentOrders = [
  {
    name: "Slow Butter Curry",
    restaurant: "Jun 28 · Riverside Kitchen",
    price: "₹389.00",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Wood-Fired Margherita",
    restaurant: "Jun 21 · Harbor Point Kitchen",
    price: "₹329.00",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Tikka Grain Bowl",
    restaurant: "Jun 15 · Riverside Kitchen",
    price: "₹299.00",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Ember Classic Cheeseburger",
    restaurant: "Jun 9 · Millbrook Kitchen",
    price: "₹319.00",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=100&q=80",
  },
]

// ============================================================
// DISH DATA
// These are the dishes that can be favorited.
// ============================================================

const favoriteDishes = [
  {
    id: 1,
    name: "Charred Double Smash",
    details: "₹349.00 · 4.9 ★",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 2,
    name: "Truffle Mushroom Tagliatelle",
    details: "₹429.00 · 4.9 ★",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 3,
    name: "Citrus Glazed Salmon",
    details: "₹499.00 · 4.8 ★",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: 4,
    name: "Heirloom Avocado Toast",
    details: "₹279.00 · 4.8 ★",
    image:
      "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=300&q=80",
  },
]

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <Card className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-none">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-[#d94b16]">
        {icon}
      </div>

      <div>
        <p className="text-lg font-semibold leading-none">
          {value}
        </p>

        <p className="mt-1 text-[9px] text-muted-foreground">
          {label}
        </p>
      </div>
    </Card>
  )
}

// ============================================================
// TRACK ORDER
// ============================================================

function TrackOrder() {
  return (
    <Card className="rounded-2xl border bg-white p-4 shadow-none">

      {/* Header */}
      <div className="flex items-start justify-between">

        <div className="flex gap-3">

          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=100&q=80"
            alt="Order"
            className="h-10 w-10 rounded-lg object-cover"
          />

          <div>

            <h2 className="text-xs font-semibold">
              Order #2841 – Charred Double Smash + 2 items
            </h2>

            <p className="mt-1 text-[8px] text-muted-foreground">
              Riverside Kitchen · Placed at 7:42 PM
            </p>

          </div>

        </div>

        <span className="rounded-full bg-orange-50 px-3 py-1 text-[8px] font-medium text-[#d94b16]">
          On the way · ETA 12 min
        </span>

      </div>

      {/* Tracking */}
      <div className="relative mt-6">

        {/* Line */}
        <div className="absolute left-[8%] right-[8%] top-4 h-px bg-gray-300" />

        <div className="relative grid grid-cols-4">

          {/* Confirmed */}
          <TrackStep
            icon={<Check className="h-3 w-3" />}
            title="Confirmed"
            active
          />

          {/* Cooking */}
          <TrackStep
            icon={<CookingPot className="h-3 w-3" />}
            title="Cooking"
            active
          />

          {/* On the way */}
          <TrackStep
            icon={<Truck className="h-3 w-3" />}
            title="On the way"
            active
          />

          {/* Delivered */}
          <TrackStep
            icon={<PackageCheck className="h-3 w-3" />}
            title="Delivered"
          />

        </div>

      </div>

      {/* Button */}
      <Button
        className="
          mt-4
          h-8
          w-full
          rounded-full
          bg-[#173b35]
          text-[10px]
          text-white
          hover:bg-[#173b35]
        "
      >
        Track Order Live
      </Button>

    </Card>
  )
}

// ============================================================
// TRACK STEP
// ============================================================

function TrackStep({
  icon,
  title,
  active = false,
}: {
  icon: React.ReactNode
  title: string
  active?: boolean
}) {
  return (
    <div className="flex flex-col items-center">

      <div
        className={`
          relative
          z-10
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-full
          border
          ${
            active
              ? "border-[#173b35] bg-[#173b35] text-white"
              : "border-gray-200 bg-gray-100 text-gray-400"
          }
        `}
      >
        {icon}
      </div>

      <span className="mt-1 text-[8px] font-medium text-gray-600">
        {title}
      </span>

    </div>
  )
}

// ============================================================
// RECENT ORDERS
// ============================================================

function RecentOrders() {
  return (
    <Card className="rounded-2xl border bg-white p-4 shadow-none">

      <div className="mb-3 flex items-center justify-between">

        <h2 className="text-sm font-semibold">
          Recent Orders
        </h2>

        <button className="text-[9px] font-medium hover:underline">
          View all
        </button>

      </div>

      <div>

        {recentOrders.map((order) => (

          <div
            key={order.name}
            className="
              flex
              items-center
              gap-2
              border-b
              py-2
              last:border-b-0
            "
          >

            <img
              src={order.image}
              alt={order.name}
              className="h-8 w-8 rounded-lg object-cover"
            />

            <div className="min-w-0 flex-1">

              <p className="truncate text-[9px] font-semibold">
                {order.name}
              </p>

              <p className="truncate text-[7px] text-muted-foreground">
                {order.restaurant}
              </p>

            </div>

            <span className="text-[9px] font-semibold text-[#d94b16]">
              {order.price}
            </span>

          </div>

        ))}

      </div>

    </Card>
  )
}

// ============================================================
// DISH CARD
// This is where the user clicks the HEART.
// ============================================================

function DishCard({
  dish,
  favorites,
  toggleFavorite,
}: {
  dish: {
    id: number
    name: string
    details: string
    image: string
  }
  favorites: number[]
  toggleFavorite: (dishId: number) => void
}) {
  const isFavorite = favorites.includes(dish.id)

  return (
    <Card className="overflow-hidden rounded-xl border bg-white shadow-none">

      {/* Image */}
      <div className="relative">

        <img
          src={dish.image}
          alt={dish.name}
          className="h-32 w-full object-cover"
        />

        {/* Heart Button */}
        <button
          type="button"
          onClick={() => toggleFavorite(dish.id)}
          aria-label={
            isFavorite
              ? `Remove ${dish.name} from favorites`
              : `Add ${dish.name} to favorites`
          }
          className="
            absolute
            right-2
            top-2
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-white
            shadow-sm
            transition
            hover:scale-105
          "
        >

          <Heart
            className={`
              h-4
              w-4
              transition
              ${
                isFavorite
                  ? "fill-[#d94b16] text-[#d94b16]"
                  : "text-gray-400"
              }
            `}
          />

        </button>

      </div>

      {/* Dish details */}
      <div className="p-3">

        <p className="truncate text-[10px] font-semibold">
          {dish.name}
        </p>

        <p className="mt-1 text-[8px] text-muted-foreground">
          {dish.details}
        </p>

      </div>

    </Card>
  )
}

// ============================================================
// FAVORITE DISHES
// Only displays dishes that have been selected.
// ============================================================

function FavoriteDishes({
  favorites,
  toggleFavorite,
}: {
  favorites: number[]
  toggleFavorite: (dishId: number) => void
}) {

  const selectedDishes = favoriteDishes.filter((dish) =>
    favorites.includes(dish.id)
  )

  return (
    <Card className="rounded-xl border bg-white p-4 shadow-none">

      {/* Header */}
      <div className="mb-3 flex items-center justify-between">

        <h2 className="text-sm font-semibold">
          Favorite Dishes
        </h2>

        <button className="text-[9px] font-medium hover:underline">
          See all
        </button>

      </div>

      {/* Favorite dishes */}
      <div>

        {selectedDishes.length > 0 ? (

          selectedDishes.map((dish) => (

            <div
              key={dish.id}
              className="
                flex
                items-center
                gap-2
                border-b
                py-2
                last:border-b-0
              "
            >

              {/* Image */}
              <img
                src={dish.image}
                alt={dish.name}
                className="h-8 w-8 rounded-lg object-cover"
              />

              {/* Information */}
              <div className="min-w-0 flex-1">

                <p className="truncate text-[9px] font-semibold">
                  {dish.name}
                </p>

                <p className="text-[7px] text-muted-foreground">
                  {dish.details}
                </p>

              </div>

              {/* Remove favorite */}
              <button
                type="button"
                onClick={() => toggleFavorite(dish.id)}
                aria-label={`Remove ${dish.name} from favorites`}
                className="
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  transition
                  hover:bg-orange-50
                "
              >

                <Heart
                  className="
                    h-3
                    w-3
                    fill-[#d94b16]
                    text-[#d94b16]
                  "
                />

              </button>

            </div>

          ))

        ) : (

          /* Empty state */
          <div className="py-6 text-center">

            <Heart className="mx-auto mb-2 h-5 w-5 text-gray-300" />

            <p className="text-[9px] font-medium text-gray-500">
              No favorite dishes yet
            </p>

            <p className="mt-1 text-[7px] text-gray-400">
              Click the heart on a dish to add it here.
            </p>

          </div>

        )}

      </div>

    </Card>
  )
}

// ============================================================
// MAIN DASHBOARD
// ============================================================

export function UserContent() {

  // ==========================================================
  // GREETING + DATE
  // ==========================================================

  const [greeting, setGreeting] = useState("")
  const [date, setDate] = useState("")

  // ==========================================================
  // FAVORITES
  // ==========================================================

  const [favorites, setFavorites] = useState<number[]>([])

  // ==========================================================
  // TOGGLE FAVORITE
  // ==========================================================

  const toggleFavorite = (dishId: number) => {

    setFavorites((currentFavorites) => {

      // If already favorite → remove it
      if (currentFavorites.includes(dishId)) {

        return currentFavorites.filter(
          (id) => id !== dishId
        )
      }

      // If not favorite → add it
      return [
        ...currentFavorites,
        dishId,
      ]
    })
  }

  // ==========================================================
  // DYNAMIC GREETING + DATE
  // ==========================================================

  useEffect(() => {

    const now = new Date()

    const hour = now.getHours()

    if (hour < 12) {

      setGreeting("Good Morning")

    } else if (hour < 18) {

      setGreeting("Good Afternoon")

    } else {

      setGreeting("Good Evening")

    }

    const formattedDate = now.toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
      }
    )

    setDate(formattedDate)

  }, [])

  // ==========================================================
  // RETURN
  // ==========================================================

  return (

    <div className="space-y-3">

      {/* =====================================================
          GREETING
          ===================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}, Alex.
          </h1>

          <p className="mt-1 text-[10px] text-muted-foreground">
            {date} · Here's what's happening with your account.
          </p>

        </div>

        <Button
          className="
            h-9
            rounded-full
            bg-[#d94b16]
            px-5
            text-[10px]
            text-white
            hover:bg-[#c44313]
          "
        >
          Order Something New

          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>

      </div>


      {/* =====================================================
          STAT CARDS
          ===================================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <StatCard
          icon={<ShoppingBag className="h-4 w-4" />}
          value="1"
          label="Active Order"
        />

        <StatCard
          icon={<ClipboardList className="h-4 w-4" />}
          value="58"
          label="Total Orders"
        />

        {/* DYNAMIC FAVORITE COUNT */}
        <StatCard
          icon={<Heart className="h-4 w-4" />}
          value={String(favorites.length)}
          label="Favorite Dishes"
        />

      </div>


      {/* =====================================================
          TRACK ORDER
          ===================================================== */}

      <TrackOrder />


      {/* =====================================================
          DISHES
          User clicks HEART here.
          ===================================================== */}

      <div>

        <div className="mb-3 flex items-center justify-between">

          <h2 className="text-sm font-semibold">
            Popular Dishes
          </h2>

          <button className="text-[9px] font-medium hover:underline">
            See all
          </button>

        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

          {favoriteDishes.map((dish) => (

            <DishCard
              key={dish.id}
              dish={dish}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />

          ))}

        </div>

      </div>


      {/* =====================================================
          RECENT ORDERS + FAVORITE DISHES
          ===================================================== */}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

        <RecentOrders />

        <FavoriteDishes
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />

      </div>

    </div>
  )
}