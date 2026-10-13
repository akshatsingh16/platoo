import type { CategoryWithItemsResponse } from "@/lib/types"

// ============================================================
// CUSTOMER MENU TYPES
// Flattened view of the backend menu used by the customer UI.
// ============================================================

export const ALL_CATEGORY = "All"

export type MenuItem = {
  id: string
  name: string
  category: string
  price: number
  image: string | null
  description: string
  isAvailable: boolean
}

/** Flatten the backend's category → items tree into a single list. */
export function toMenuItems(categories: CategoryWithItemsResponse[]): MenuItem[] {
  return categories
    .filter((category) => category.isActive !== false)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .flatMap((category) =>
      [...category.items]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((item) => ({
          id: item.id,
          name: item.name,
          category: category.name,
          price: Number(item.price),
          image: item.imageUrl,
          description: item.description ?? "",
          isAvailable: item.isAvailable,
        })),
    )
}

/** Category tab labels, in menu order, prefixed with "All". */
export function toCategoryNames(categories: CategoryWithItemsResponse[]): string[] {
  return [
    ALL_CATEGORY,
    ...categories
      .filter((category) => category.isActive !== false && category.items.length > 0)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((category) => category.name),
  ]
}