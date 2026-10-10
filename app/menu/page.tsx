"use client"

import { useMemo, useState } from "react"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { AppSidebar } from "@/components/usercontent/usersidebar"

import { MenuHeader } from "@/components/menu/menuheader"
import { MenuSearch } from "@/components/menu/menusearch"
import { MenuCategories } from "@/components/menu/menucategories"
import { MenuGrid } from "@/components/menu/menugrid"
import { CartDrawer } from "@/components/menu/cartdrawer"

import { menuItems } from "@/components/menu/menudata"

import type { Category } from "@/components/menu/menudata"

export default function MenuPage() {

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [search, setSearch] = useState("")


  // ==========================================================
  // CATEGORY
  // ==========================================================

  const [selectedCategory, setSelectedCategory] =
    useState<Category>("All")


  // ==========================================================
  // SORT
  // ==========================================================

  const [sort, setSort] = useState("Popular")


  // ==========================================================
  // FAVORITES
  // ==========================================================

  const [favorites, setFavorites] =
    useState<number[]>([])


  // ==========================================================
  // CART
  // ==========================================================

  const [cart, setCart] =
    useState<Record<number, number>>({})


  // ==========================================================
  // CART DRAWER
  // ==========================================================

  const [cartOpen, setCartOpen] =
    useState(false)


  // ==========================================================
  // FAVORITE TOGGLE
  // ==========================================================

  const toggleFavorite = (id: number) => {

    setFavorites((current) => {

      if (current.includes(id)) {

        return current.filter(
          (favoriteId) =>
            favoriteId !== id
        )
      }

      return [
        ...current,
        id,
      ]
    })
  }


  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const addToCart = (id: number) => {

    setCart((current) => ({
      ...current,

      [id]:
        (current[id] || 0) + 1,
    }))
  }


  // ==========================================================
  // REMOVE FROM CART
  // ==========================================================

  const removeFromCart = (id: number) => {

    setCart((current) => {

      const quantity =
        current[id] || 0


      // Remove item completely
      if (quantity <= 1) {

        const updated = {
          ...current,
        }

        delete updated[id]

        return updated
      }


      // Decrease quantity
      return {
        ...current,

        [id]:
          quantity - 1,
      }
    })
  }


  // ==========================================================
  // CART COUNT
  // ==========================================================

  const cartCount =
    Object.values(cart).reduce(
      (total, quantity) =>
        total + quantity,
      0
    )


  // ==========================================================
  // FILTER + SEARCH + SORT
  // ==========================================================

  const filteredItems =
    useMemo(() => {

      let result = [
        ...menuItems,
      ]


      // ------------------------------------------------------
      // CATEGORY
      // ------------------------------------------------------

      if (
        selectedCategory !== "All"
      ) {

        result =
          result.filter(
            (item) =>
              item.category ===
              selectedCategory
          )
      }


      // ------------------------------------------------------
      // SEARCH
      // ------------------------------------------------------

      if (search.trim()) {

        const query =
          search
            .toLowerCase()
            .trim()

        result =
          result.filter(
            (item) =>
              `${item.name} ${item.description}`
                .toLowerCase()
                .includes(query)
          )
      }


      // ------------------------------------------------------
      // SORT
      // ------------------------------------------------------

      if (
        sort ===
        "Price: Low to High"
      ) {

        result.sort(
          (a, b) =>
            a.price - b.price
        )

      } else if (
        sort ===
        "Price: High to Low"
      ) {

        result.sort(
          (a, b) =>
            b.price - a.price
        )

      } else if (
        sort === "Rating"
      ) {

        result.sort(
          (a, b) =>
            b.rating - a.rating
        )

      } else {

        // Popular
        result.sort(
          (a, b) =>
            Number(b.popular) -
            Number(a.popular)
        )
      }


      return result

    }, [
      search,
      selectedCategory,
      sort,
    ])


  // ==========================================================
  // CART ITEMS
  // ==========================================================

  const cartItems =
    menuItems.filter(
      (item) =>
        cart[item.id]
    )


  // ==========================================================
  // CART TOTAL
  // ==========================================================

  const cartTotal =
    cartItems.reduce(
      (total, item) =>
        total +
        item.price *
          (cart[item.id] || 0),
      0
    )


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <SidebarProvider>

      {/* ====================================================
          SIDEBAR
          ==================================================== */}

      <AppSidebar />


      {/* ====================================================
          MAIN CONTENT
          ==================================================== */}

      <SidebarInset>

        <main className="min-h-screen bg-[#f5efe3] p-4 sm:p-5">

          {/* ================================================
              HEADER
              ================================================ */}

          <MenuHeader
            cartCount={cartCount}
            onCartClick={() =>
              setCartOpen(true)
            }
          />


          {/* ================================================
              SEARCH + SORT
              ================================================ */}

          <MenuSearch
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
          />


          {/* ================================================
              CATEGORIES
              ================================================ */}

          <MenuCategories
            selectedCategory={
              selectedCategory
            }
            setSelectedCategory={
              setSelectedCategory
            }
          />


          {/* ================================================
              SECTION TITLE
              ================================================ */}

          <div className="mb-3">

            <h2 className="text-base font-semibold">
              {selectedCategory === "All"
                ? "All Dishes"
                : selectedCategory}
            </h2>

            <p className="text-[8px] text-muted-foreground">
              {filteredItems.length} dishes available
            </p>

          </div>


          {/* ================================================
              MENU GRID
              ================================================ */}

          <MenuGrid
            items={filteredItems}
            favorites={favorites}
            cart={cart}
            onToggleFavorite={
              toggleFavorite
            }
            onAdd={addToCart}
            onRemove={removeFromCart}
          />

        </main>

      </SidebarInset>


      {/* ====================================================
          CART DRAWER
          ==================================================== */}

      <CartDrawer
        open={cartOpen}
        onClose={() =>
          setCartOpen(false)
        }
        cartItems={cartItems}
        cart={cart}
        cartTotal={cartTotal}
        onAdd={addToCart}
        onRemove={removeFromCart}
      />

    </SidebarProvider>
  )
}