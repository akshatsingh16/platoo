"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"

import {
  getCurrentSession,
  getPublicMenu,
  getSessionOrders,
  getBillSummary,
  placeOrder,
  requestBill,
} from "@/lib/api"
import { getSessionToken } from "@/lib/auth"
import type {
  CategoryWithItemsResponse,
  CustomerSessionResponse,
  OrderResponse,
  BillSummaryResponse,
  PaymentMethod,
} from "@/lib/types"

import { MenuHeader } from "@/components/menu/menuheader"
import { MenuSearch } from "@/components/menu/menusearch"
import { MenuCategories } from "@/components/menu/menucategories"
import { MenuGrid } from "@/components/menu/menugrid"
import { CartDrawer } from "@/components/menu/cartdrawer"
import { OrdersDrawer } from "@/components/menu/ordersdrawer"

import {
  ALL_CATEGORY,
  toCategoryNames,
  toMenuItems,
  type MenuItem,
} from "@/components/menu/menudata"
import { AlertCircle, CheckCircle2, Loader2, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"

function MenuContent() {
  const searchParams = useSearchParams()
  const queryRestaurantId = searchParams.get("restaurantId")

  const [session, setSession] = useState<CustomerSessionResponse | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)

  const [categoriesData, setCategoriesData] = useState<CategoryWithItemsResponse[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [menuError, setMenuError] = useState<string | null>(null)

  // Filtering & Search
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY)
  const [sort, setSort] = useState("Popular")

  // Cart
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null)
  const [orderError, setOrderError] = useState<string | null>(null)

  // Placed Orders & Bill
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [billSummary, setBillSummary] = useState<BillSummaryResponse | null>(null)
  const [ordersOpen, setOrdersOpen] = useState(false)
  const [requestingBill, setRequestingBill] = useState(false)
  const [billRequested, setBillRequested] = useState(false)

  // 1. Initial Session Check
  useEffect(() => {
    const token = getSessionToken()
    setSessionToken(token)

    if (token) {
      getCurrentSession(token)
        .then((s) => {
          setSession(s)
        })
        .catch(() => {
          // Session expired or invalid
          setSession(null)
        })

      // Fetch active orders & bill
      getSessionOrders(token)
        .then(setOrders)
        .catch(() => {})

      getBillSummary(token)
        .then(setBillSummary)
        .catch(() => {})
    }
  }, [])

  // Poll orders status every 15s if session is active
  useEffect(() => {
    if (!sessionToken) return
    const interval = setInterval(() => {
      getSessionOrders(sessionToken).then(setOrders).catch(() => {})
      getBillSummary(sessionToken).then(setBillSummary).catch(() => {})
    }, 15000)
    return () => clearInterval(interval)
  }, [sessionToken])

  const restaurantId = queryRestaurantId || session?.restaurantId

  // 2. Fetch Public Menu
  const loadMenu = useCallback(async () => {
    if (!restaurantId) {
      setLoadingMenu(false)
      return
    }

    try {
      setLoadingMenu(true)
      setMenuError(null)
      const data = await getPublicMenu(restaurantId)
      setCategoriesData(data)
    } catch (err) {
      setMenuError(
        err instanceof Error ? err.message : "Unable to load restaurant menu.",
      )
    } finally {
      setLoadingMenu(false)
    }
  }, [restaurantId])

  useEffect(() => {
    loadMenu()
  }, [loadMenu])

  // Flattened Menu Items & Category Names
  const allItems: MenuItem[] = useMemo(() => {
    return toMenuItems(categoriesData)
  }, [categoriesData])

  const categoryNames = useMemo(() => {
    return toCategoryNames(categoriesData)
  }, [categoriesData])

  // Cart operations
  const addToCart = (id: string) => {
    setCart((current) => ({
      ...current,
      [id]: (current[id] || 0) + 1,
    }))
  }

  const removeFromCart = (id: string) => {
    setCart((current) => {
      const quantity = current[id] || 0
      if (quantity <= 1) {
        const next = { ...current }
        delete next[id]
        return next
      }
      return {
        ...current,
        [id]: quantity - 1,
      }
    })
  }

  const cartCount = Object.values(cart).reduce((sum, q) => sum + q, 0)

  const cartItems = useMemo(() => {
    const itemMap = new Map(allItems.map((i) => [i.id, i]))
    return Object.keys(cart)
      .map((id) => itemMap.get(id))
      .filter((i): i is MenuItem => Boolean(i))
  }, [allItems, cart])

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * (cart[item.id] || 0), 0)
  }, [cartItems, cart])

  // Place Order handler
  const handlePlaceOrder = async (notes?: string) => {
    if (!sessionToken) {
      setOrderError("Please scan your table QR code to start a dining session before ordering.")
      return
    }

    const items = Object.entries(cart).map(([menuItemId, quantity]) => ({
      menuItemId,
      quantity,
    }))

    if (items.length === 0) return

    setPlacingOrder(true)
    setOrderError(null)

    try {
      const placed = await placeOrder(sessionToken, { items, notes })
      setCart({})
      setCartOpen(false)
      setOrderSuccessMessage(`Order #${placed.orderNumber} sent to kitchen!`)
      setTimeout(() => setOrderSuccessMessage(null), 5000)

      // Refresh orders and bill summary
      const [updatedOrders, updatedBill] = await Promise.all([
        getSessionOrders(sessionToken),
        getBillSummary(sessionToken),
      ])
      setOrders(updatedOrders)
      setBillSummary(updatedBill)
      setOrdersOpen(true)
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : "Failed to place order.")
    } finally {
      setPlacingOrder(false)
    }
  }

  // Request Bill handler
  const handleRequestBill = async (paymentMethod: PaymentMethod) => {
    if (!sessionToken) return
    setRequestingBill(true)
    try {
      await requestBill(sessionToken, { paymentMethod })
      setBillRequested(true)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to request bill.")
    } finally {
      setRequestingBill(false)
    }
  }

  // Filter + Search + Sort
  const filteredItems = useMemo(() => {
    let result = [...allItems]

    if (selectedCategory !== ALL_CATEGORY) {
      result = result.filter((item) => item.category === selectedCategory)
    }

    if (search.trim()) {
      const query = search.toLowerCase().trim()
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query),
      )
    }

    if (sort === "Price: Low to High") {
      result.sort((a, b) => a.price - b.price)
    } else if (sort === "Price: High to Low") {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }, [allItems, selectedCategory, search, sort])

  return (
    <div className="min-h-screen bg-[#f5efe3] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <MenuHeader
          restaurantName={session?.restaurantName || "Plato Dining"}
          tableNumber={session?.tableNumber}
          cartCount={cartCount}
          activeOrdersCount={orders.length}
          onCartClick={() => setCartOpen(true)}
          onOrdersClick={() => setOrdersOpen(true)}
        />

        {/* Success toast */}
        {orderSuccessMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-xs font-semibold text-green-800 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            {orderSuccessMessage}
          </div>
        )}

        {/* No Restaurant Prompt */}
        {!restaurantId && (
          <div className="my-12 rounded-2xl border bg-white p-8 text-center shadow-sm">
            <QrCode className="mx-auto mb-3 h-10 w-10 text-orange-500" />
            <h2 className="text-base font-bold text-gray-900">Scan Table QR to Order</h2>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
              Please scan the QR code located on your table to access the restaurant's menu and start ordering.
            </p>
          </div>
        )}

        {/* Loading */}
        {loadingMenu && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="mt-3 text-xs text-muted-foreground">Loading fresh dishes...</p>
          </div>
        )}

        {/* Error */}
        {menuError && (
          <div className="my-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            <AlertCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />
            <p className="text-sm font-semibold">{menuError}</p>
            <Button
              onClick={loadMenu}
              variant="outline"
              size="sm"
              className="mt-3 text-xs"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Menu Content */}
        {!loadingMenu && !menuError && restaurantId && (
          <>
            {/* Search + Sort */}
            <MenuSearch
              search={search}
              setSearch={setSearch}
              sort={sort}
              setSort={setSort}
            />

            {/* Category tabs */}
            <MenuCategories
              categories={categoryNames}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />

            {/* Section heading */}
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-bold text-gray-900">
                {selectedCategory === ALL_CATEGORY ? "All Dishes" : selectedCategory}
              </h2>
              <span className="text-xs text-muted-foreground">
                {filteredItems.length} {filteredItems.length === 1 ? "dish" : "dishes"} available
              </span>
            </div>

            {/* Grid */}
            <MenuGrid
              items={filteredItems}
              cart={cart}
              onAdd={addToCart}
              onRemove={removeFromCart}
            />
          </>
        )}

        {/* Cart Drawer */}
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          cartItems={cartItems}
          cart={cart}
          cartTotal={cartTotal}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onPlaceOrder={handlePlaceOrder}
          placingOrder={placingOrder}
          error={orderError}
        />

        {/* Orders & Bill Drawer */}
        <OrdersDrawer
          open={ordersOpen}
          onClose={() => setOrdersOpen(false)}
          orders={orders}
          billSummary={billSummary}
          onRequestBill={handleRequestBill}
          requestingBill={requestingBill}
          billRequested={billRequested}
        />
      </div>
    </div>
  )
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5efe3]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  )
}