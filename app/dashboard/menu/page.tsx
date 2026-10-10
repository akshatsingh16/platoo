"use client"

import { formatCurrency } from "@/lib/utils"
import { useEffect, useState, useCallback } from "react"
import { useRestaurant } from "@/components/restaurant-context"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
} from "@/lib/api"
import type {
  CategoryWithItemsResponse,
  MenuItemResponse,
  CreateCategoryRequest,
  CreateItemRequest,
} from "@/lib/types"

import { AppSidebar } from "@/components/dashboardcontent/sidebar"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  Loader2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Utensils,
} from "lucide-react"

export default function MenuManagementPage() {
  const { restaurant } = useRestaurant()
  const [categories, setCategories] = useState<CategoryWithItemsResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Expanded categories
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set())

  // Create category form
  const [showCreateCat, setShowCreateCat] = useState(false)
  const [newCat, setNewCat] = useState<CreateCategoryRequest>({ name: "" })

  // Create item form
  const [showCreateItem, setShowCreateItem] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<Omit<CreateItemRequest, "categoryId">>({
    name: "",
    price: 0,
  })

  // Edit category
  const [editCatId, setEditCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState("")

  // Edit item
  const [editItemId, setEditItemId] = useState<string | null>(null)
  const [editItemData, setEditItemData] = useState({ name: "", price: 0, description: "" })

  const fetchMenu = useCallback(async () => {
    if (!restaurant) return
    try {
      setLoading(true)
      const data = await getCategories(restaurant.id)
      setCategories(data)
      // Expand all by default
      setExpandedCats(new Set(data.map((c) => c.id)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu")
    } finally {
      setLoading(false)
    }
  }, [restaurant])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu])

  const toggleExpand = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Category CRUD
  const handleCreateCategory = async () => {
    if (!restaurant || !newCat.name) return
    try {
      await createCategory(restaurant.id, newCat)
      setShowCreateCat(false)
      setNewCat({ name: "" })
      await fetchMenu()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category")
    }
  }

  const handleUpdateCategory = async (catId: string) => {
    if (!restaurant) return
    try {
      await updateCategory(restaurant.id, catId, { name: editCatName })
      setEditCatId(null)
      await fetchMenu()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category")
    }
  }

  const handleDeleteCategory = async (catId: string) => {
    if (!restaurant || !confirm("Delete this category and all its items?")) return
    try {
      await deleteCategory(restaurant.id, catId)
      await fetchMenu()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category")
    }
  }

  // Item CRUD
  const handleCreateItem = async (categoryId: string) => {
    if (!restaurant || !newItem.name) return
    try {
      await createMenuItem(restaurant.id, { ...newItem, categoryId })
      setShowCreateItem(null)
      setNewItem({ name: "", price: 0 })
      await fetchMenu()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item")
    }
  }

  const handleUpdateItem = async (itemId: string) => {
    if (!restaurant) return
    try {
      await updateMenuItem(restaurant.id, itemId, editItemData)
      setEditItemId(null)
      await fetchMenu()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item")
    }
  }

  const handleToggleAvailability = async (itemId: string) => {
    if (!restaurant) return
    try {
      await toggleMenuItemAvailability(restaurant.id, itemId)
      await fetchMenu()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle availability")
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!restaurant || !confirm("Delete this menu item?")) return
    try {
      await deleteMenuItem(restaurant.id, itemId)
      await fetchMenu()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item")
    }
  }

  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="min-h-screen bg-[#f7f7f6]">
          <div className="px-3 pt-2">
            <SidebarTrigger />
          </div>

          <div className="px-4 pb-6 pt-2">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Menu Management</h1>
                <p className="text-xs text-muted-foreground">
                  {categories.length} categories · {totalItems} items
                </p>
              </div>
              <Button
                onClick={() => setShowCreateCat(true)}
                className="gap-1.5 rounded-lg bg-orange-500 text-xs hover:bg-orange-600"
                size="sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Category
              </Button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {error}
                <button onClick={() => setError("")} className="ml-2 font-bold">
                  ×
                </button>
              </div>
            )}

            {/* Create category form */}
            {showCreateCat && (
              <Card className="mb-4 rounded-xl border bg-white p-4 shadow-none">
                <h3 className="mb-3 text-sm font-medium">New Category</h3>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Input
                      value={newCat.name}
                      onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                      placeholder="Category name"
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button
                    onClick={handleCreateCategory}
                    size="sm"
                    className="h-8 rounded bg-orange-500 text-xs hover:bg-orange-600"
                  >
                    Create
                  </Button>
                  <Button
                    onClick={() => setShowCreateCat(false)}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Categories + Items */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : categories.length === 0 ? (
              <Card className="flex flex-col items-center gap-2 rounded-xl border bg-white p-8 shadow-none">
                <Utensils className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-muted-foreground">
                  No menu categories yet. Create your first one!
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => (
                  <Card key={cat.id} className="rounded-xl border bg-white shadow-none">
                    {/* Category header */}
                    <div className="flex items-center gap-2 border-b px-4 py-3">
                      <button
                        onClick={() => toggleExpand(cat.id)}
                        className="text-muted-foreground"
                      >
                        {expandedCats.has(cat.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>

                      {editCatId === cat.id ? (
                        <div className="flex flex-1 items-center gap-2">
                          <Input
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="h-7 flex-1 text-xs"
                          />
                          <Button
                            onClick={() => handleUpdateCategory(cat.id)}
                            size="sm"
                            className="h-7 rounded bg-green-500 text-xs"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => setEditCatId(null)}
                            variant="ghost"
                            size="sm"
                            className="h-7"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <h3 className="flex-1 text-sm font-semibold">{cat.name}</h3>
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] text-muted-foreground">
                            {cat.items.length} items
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditCatId(cat.id)
                              setEditCatName(cat.name)
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500"
                            onClick={() => handleDeleteCategory(cat.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Items */}
                    {expandedCats.has(cat.id) && (
                      <div className="px-4 py-2">
                        {cat.items.length === 0 ? (
                          <p className="py-3 text-center text-xs text-muted-foreground">
                            No items in this category
                          </p>
                        ) : (
                          <div className="divide-y">
                            {cat.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 py-2.5"
                              >
                                {editItemId === item.id ? (
                                  <div className="flex flex-1 flex-wrap items-center gap-2">
                                    <Input
                                      value={editItemData.name}
                                      onChange={(e) =>
                                        setEditItemData({
                                          ...editItemData,
                                          name: e.target.value,
                                        })
                                      }
                                      className="h-7 w-40 text-xs"
                                      placeholder="Name"
                                    />
                                    <Input
                                      type="number"
                                      value={editItemData.price}
                                      onChange={(e) =>
                                        setEditItemData({
                                          ...editItemData,
                                          price: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                      className="h-7 w-20 text-xs"
                                    />
                                    <Input
                                      value={editItemData.description}
                                      onChange={(e) =>
                                        setEditItemData({
                                          ...editItemData,
                                          description: e.target.value,
                                        })
                                      }
                                      className="h-7 flex-1 text-xs"
                                      placeholder="Description"
                                    />
                                    <Button
                                      onClick={() => handleUpdateItem(item.id)}
                                      size="sm"
                                      className="h-7 rounded bg-green-500 text-xs"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      onClick={() => setEditItemId(null)}
                                      variant="ghost"
                                      size="sm"
                                      className="h-7"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium">{item.name}</p>
                                      {item.description && (
                                        <p className="truncate text-[10px] text-muted-foreground">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-xs font-semibold">
                                      {formatCurrency(item.price)}
                                    </span>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[8px] font-medium ${
                                        item.isAvailable
                                          ? "bg-green-100 text-green-700"
                                          : "bg-red-100 text-red-600"
                                      }`}
                                    >
                                      {item.isAvailable ? "Available" : "Unavailable"}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      title="Toggle availability"
                                      onClick={() => handleToggleAvailability(item.id)}
                                    >
                                      {item.isAvailable ? (
                                        <Eye className="h-3 w-3" />
                                      ) : (
                                        <EyeOff className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        setEditItemId(item.id)
                                        setEditItemData({
                                          name: item.name,
                                          price: item.price,
                                          description: item.description || "",
                                        })
                                      }}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-red-500"
                                      onClick={() => handleDeleteItem(item.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add item form */}
                        {showCreateItem === cat.id ? (
                          <div className="flex flex-wrap items-end gap-2 border-t pt-3">
                            <Input
                              value={newItem.name}
                              onChange={(e) =>
                                setNewItem({ ...newItem, name: e.target.value })
                              }
                              placeholder="Item name"
                              className="h-7 w-40 text-xs"
                            />
                            <Input
                              type="number"
                              value={newItem.price || ""}
                              onChange={(e) =>
                                setNewItem({
                                  ...newItem,
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                              placeholder="Price"
                              className="h-7 w-20 text-xs"
                            />
                            <Input
                              value={newItem.description || ""}
                              onChange={(e) =>
                                setNewItem({ ...newItem, description: e.target.value })
                              }
                              placeholder="Description"
                              className="h-7 flex-1 text-xs"
                            />
                            <Button
                              onClick={() => handleCreateItem(cat.id)}
                              size="sm"
                              className="h-7 rounded bg-orange-500 text-xs"
                            >
                              Add
                            </Button>
                            <Button
                              onClick={() => setShowCreateItem(null)}
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setShowCreateItem(cat.id)
                              setNewItem({ name: "", price: 0 })
                            }}
                            className="mt-1 flex items-center gap-1 border-t pt-2 text-[10px] text-orange-500 hover:text-orange-600"
                          >
                            <Plus className="h-3 w-3" /> Add item
                          </button>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
