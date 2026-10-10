import type { Category } from "./menudata"
import { categories } from "./menudata"

type MenuCategoriesProps = {
  selectedCategory: Category
  setSelectedCategory: (category: Category) => void
}

export function MenuCategories({
  selectedCategory,
  setSelectedCategory,
}: MenuCategoriesProps) {
  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1">

      {categories.map((category) => {

        const active =
          selectedCategory === category

        return (
          <button
            key={category}
            type="button"
            onClick={() =>
              setSelectedCategory(category)
            }
            className={`
              whitespace-nowrap
              rounded-full
              px-4
              py-2
              text-[9px]
              font-medium
              transition
              ${
                active
                  ? "bg-[#153f38] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            {category}
          </button>
        )
      })}

    </div>
  )
}